import db from '$lib/server/db';
import { getBucket } from '$lib/server/histogram';
import { toUTCTimeString } from '$lib/utils';
import type { Actions } from './$types';

function convertTo12HourFormat(time24) {
	const [hours, minutes] = time24.split(':');
	const hoursInt = parseInt(hours, 10);
	const ampm = hoursInt >= 12 ? 'PM' : 'AM';
	let hours12 = hoursInt % 12;
	if (hours12 === 0) hours12 = 12;
	return `${hours12}:${minutes} ${ampm}`;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const sid = url.searchParams.get('sid');

	// console.log(sid);

	if (sid === null || sid === undefined || sid === '' || sid.match(/^[0-9]+$/) === null) {
		return {
			showGenerated: false,
			sid: null
		};
	}

	try {
		const res = await db.xfmrDimension.findUnique({
			where: {
				XFMR_SID: parseInt(sid)
			}
		});

		if (res === null) {
			return {
				showGenerated: false,
				sid: null
			};
		}

		return {
			showGenerated: true,
			sid: parseInt(sid)
		};
	} catch (e) {
		console.log(e);
	}

	return {
		showGenerated: false,
		sid: 0
	};
}

export const actions: Actions = {
	generate: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const kva_rating = Number(formData.kva_rating);
		const selectedMonth = formData.month; // This should be the input from the user, in the format YYYY-MM
		const evload = Number(formData.ev_load);
		const interval = Number(formData.interval);
		const simulate_ev_load = formData.simulate_ev_load === 'true';

		const errors = [];

		if (interval === undefined || interval === null || isNaN(interval) || interval === 0) {
			errors.push({
				field: 'interval',
				message: 'Please enter a valid interval.'
			});
		}

		if (kva_rating === undefined || kva_rating === null || isNaN(kva_rating) || kva_rating === 0) {
			errors.push({
				field: 'kva_rating',
				message: 'Please select a valid KVA rating.'
			});
		}

		// Ev load fields
		if (selectedMonth === undefined || selectedMonth === null || selectedMonth === '') {
			errors.push({
				field: 'month',
				message: 'Please select a valid month.'
			});
		}

		if (
			(evload === undefined || evload === null || isNaN(evload) || evload === 0) &&
			simulate_ev_load
		) {
			errors.push({
				field: 'evload',
				message: 'Please enter a valid EV load.'
			});
		}

		if (errors.length > 0) {
			return {
				message: 'Invalid field data.',
				data: null,
				errors: errors
			};
		}

		const startDate = new Date(`${selectedMonth}-01T00:00:00.000Z`); // Start of the month in UTC
		// Use Date.UTC to get the timestamp for the end of the month in UTC
		const utcEndTimestamp = Date.UTC(
			startDate.getUTCFullYear(),
			startDate.getUTCMonth() + 1, // Get the next month
			0, // Use day 0 to get the last day of the previous month
			23,
			59,
			59,
			999 // End of the day in UTC
		);
		const endDate = new Date(utcEndTimestamp);

		// Get corresponding interval record
		const intervalRecord = await db.xfmrTimeInterval.findUnique({
			where: {
				ID: interval
			}
		});

		const convertedStart = toUTCTimeString(intervalRecord.Start); // 18:00
		const convertedEnd = toUTCTimeString(intervalRecord.End); // 19:00

		const from = String(convertedStart);
		const to = String(convertedEnd);

		// Get the start and end times for the time interval from the interval record
		const timeOfDayFromParts = from.split(':').map((part) => parseInt(part, 10));
		const timeOfDayToParts = to.split(':').map((part) => parseInt(part, 10));

		// Convert kva_rating to a string to match the database format if necessary
		const kva_rating_str = `${kva_rating}.0`;
		// Retrieve the peak KVA measures for each transformer
		const peakMeasures = await db.$queryRaw`
			SELECT 
				DISTINCT ON (m."XFMR_SID") 
				m."XFMR_SID",
				m."KVA_MEASURE" AS "KVAMEASURE",
				m."MEASURE_DATE",
				m."UTC_TIME"
			FROM 
				"XfmrMeasure" m
			JOIN 
				"XfmrDimension" d ON m."XFMR_SID" = d."XFMR_SID"
			WHERE 
				m."MEASURE_DATE" BETWEEN ${startDate} AND ${endDate}
				AND EXTRACT(HOUR FROM m."UTC_TIME") >= ${timeOfDayFromParts[0]}
				AND (EXTRACT(HOUR FROM m."UTC_TIME") < ${timeOfDayToParts[0]}
					OR (
						EXTRACT(HOUR FROM m."UTC_TIME") = ${timeOfDayToParts[0]}
						AND EXTRACT(MINUTE FROM m."UTC_TIME") < ${timeOfDayToParts[1]}
					))
				AND d."KVA_RATING" = ${kva_rating_str}
			ORDER BY 
				m."XFMR_SID", 
				m."KVA_MEASURE" DESC;
		`;

		// Bucket logic now uses peakMeasures
		const bucketCounts = Array.from({ length: 19 }, () => ({ value: 0, transformers: [] }));
		peakMeasures.forEach((peakMeasure) => {
			const percentage = (peakMeasure.KVAMEASURE / kva_rating) * 100;
			const bucket = getBucket(percentage);
			bucketCounts[bucket].value += 1;

			// Check if the transformer ID is already in the bucket
			const transformerExists = bucketCounts[bucket].transformers.some(
				(transformer) => transformer.id === peakMeasure.XFMR_SID
			);

			if (!transformerExists) {
				bucketCounts[bucket].transformers.push({
					id: peakMeasure.XFMR_SID,
					measure: peakMeasure.KVAMEASURE.toFixed(3),
					load_percentage: percentage.toFixed(3),
					bucket: bucket,
					time: peakMeasure.MEASURE_DATE
				});
			}
		});

		// Helper function to create bucketCounts list based on EV load
		const createBucketCountsBasedOnEvLoad = (measures) => {
			const bucketCountsEvLoad = Array.from({ length: 19 }, () => ({ value: 0, transformers: [] }));

			measures.forEach((measure) => {
				// Calculate the extra load based on the EV load
				const extraLoad = (7.5 / 0.9) * evload;
				// Adjust the peak measure by adding the extra load
				const adjustedPeakMeasure = measure.KVAMEASURE + extraLoad;
				const percentage = (adjustedPeakMeasure / kva_rating) * 100;
				const bucket = getBucket(percentage);

				bucketCountsEvLoad[bucket].value += 1;

				// Check if the transformer ID is already in the bucket for EV load
				const transformerExists = bucketCountsEvLoad[bucket].transformers.some(
					(transformer) => transformer.id === measure.XFMR_SID
				);

				if (!transformerExists) {
					bucketCountsEvLoad[bucket].transformers.push({
						id: measure.XFMR_SID,
						measure: adjustedPeakMeasure.toFixed(3),
						load_percentage: percentage.toFixed(3),
						bucket: bucket,
						time: measure.MEASURE_DATE
					});
				}
			});

			return bucketCountsEvLoad;
		};

		// Assuming you have validated evload and it is the maximum EV load
		const peakMeasuresEvLoad = createBucketCountsBasedOnEvLoad(peakMeasures);


		// Get total available KW, but first convert KVA measure back to KW, and also subtract it from the KVA rating
		const total_available_kw = peakMeasures.reduce((acc, curr) => {
			const kw = curr.KVAMEASURE * 0.9;
			return acc + (kva_rating - kw);
		}, 0);

		// Get total available KW for EV load
		const total_available_kw_ev = peakMeasures.reduce((acc, curr) => {
			const extraLoad = (7.5 / 0.9) * evload;
			const adjustedPeakMeasure = curr.KVAMEASURE + extraLoad;
			const kw = adjustedPeakMeasure * 0.9;
			return acc + (kva_rating - kw);
		}, 0);


		// Convert the 24-hour format to 12-hour format for both start and end times
		const time_interval_string = `${convertTo12HourFormat(from)} - ${convertTo12HourFormat(to)}`;

		return {
			message: 'Success',
			data: {
				buckets: bucketCounts,
				bucketsEV: peakMeasuresEvLoad,
				evload: evload,
				month: new Date(startDate).toLocaleString('default', { month: 'long', timeZone: 'UTC' }),
				year: startDate.getFullYear(),
				time_interval_string: time_interval_string,
				kva_rating,
				total_available_kw: total_available_kw,
				total_available_kw_ev: total_available_kw_ev,
			}
		};
	}
};
