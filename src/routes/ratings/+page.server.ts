import db from '$lib/server/db';
import { getBucket } from '$lib/server/histogram';
import type { Actions } from './$types';

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
		const time_of_day_from = formData.time_of_day_from;
		const time_of_day_to = formData.time_of_day_to;
		const simulate_ev_load = formData.simulate_ev_load === 'true';

		const errors = [];

		if (kva_rating === undefined || kva_rating === null || isNaN(kva_rating) || kva_rating === 0) {
			errors.push({
				field: 'kva_rating',
				message: 'Please select a valid KVA rating.'
			});
		}

		// Ev load fields
		if (
			(selectedMonth === undefined || selectedMonth === null || selectedMonth === '') &&
			simulate_ev_load
		) {
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

		if (
			(time_of_day_from === undefined || time_of_day_from === null || time_of_day_from === '') &&
			simulate_ev_load
		) {
			errors.push({
				field: 'time_of_day_from',
				message: 'Please select a valid time of day.'
			});
		}

		if (
			(time_of_day_to === undefined || time_of_day_to === null || time_of_day_to === '') &&
			simulate_ev_load
		) {
			errors.push({
				field: 'time_of_day_to',
				message: 'Please select a valid time of day.'
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

		const from = String(time_of_day_from);
		const to = String(time_of_day_to);

		const timeOfDayFromParts = from.split(':').map((part) => parseInt(part, 10));
		const timeOfDayToParts = to.split(':').map((part) => parseInt(part, 10));

		// Assuming formData.kva_rating is already validated to be a valid number
		const kva_rating_str = `${kva_rating}.0`; // Convert to string and append .0

		const maxMeasures = await db.$queryRaw`
			SELECT "XfmrMeasure".*, "XfmrDimension".*
			FROM "XfmrMeasure"
			JOIN "XfmrDimension" ON "XfmrMeasure"."XFMR_SID" = "XfmrDimension"."XFMR_SID"
			WHERE "XfmrMeasure"."MEASURE_DATE" BETWEEN ${startDate} AND ${endDate}
			AND "XfmrDimension"."KVA_RATING" = ${kva_rating_str}
			AND (
				EXTRACT(HOUR FROM "XfmrMeasure"."UTC_TIME") > ${timeOfDayFromParts[0]}
				OR (
					EXTRACT(HOUR FROM "XfmrMeasure"."UTC_TIME") = ${timeOfDayFromParts[0]}
					AND EXTRACT(MINUTE FROM "XfmrMeasure"."UTC_TIME") >= ${timeOfDayFromParts[1]}
				)
			)
			AND (
				EXTRACT(HOUR FROM "XfmrMeasure"."UTC_TIME") < ${timeOfDayToParts[0]}
				OR (
					EXTRACT(HOUR FROM "XfmrMeasure"."UTC_TIME") = ${timeOfDayToParts[0]}
					AND EXTRACT(MINUTE FROM "XfmrMeasure"."UTC_TIME") < ${timeOfDayToParts[1]}
				)
			);
		`;


		// Helper function to find the peak measure for each transformer
		const findPeakMeasures = (measures) => {
			const peakMeasures = {};

			measures.forEach((measure) => {
				// If the transformer has not been added or the current measure is greater than the existing one, update it
				if (
					!peakMeasures[measure.XFMR_SID] ||
					peakMeasures[measure.XFMR_SID].KVA_MEASURE < measure.KVA_MEASURE
				) {
					peakMeasures[measure.XFMR_SID] = measure;
				}
			});

			return Object.values(peakMeasures); // Return an array of peak measures
		};

		const peakMeasures = findPeakMeasures(maxMeasures);

		// Bucket logic now uses peakMeasures
		const bucketCounts = Array.from({ length: 19 }, () => ({ value: 0, transformers: [] }));
		peakMeasures.forEach((peakMeasure) => {

			const percentage =
				(peakMeasure.KVA_MEASURE / parseFloat(peakMeasure.KVA_RATING)) * 100;
			const bucket = getBucket(percentage);
			bucketCounts[bucket].value += 1;

			// Check if the transformer ID is already in the bucket
			const transformerExists = bucketCounts[bucket].transformers.some(
				(transformer) => transformer.id === peakMeasure.XFMR_SID
			);

			if (!transformerExists) {
				bucketCounts[bucket].transformers.push({
					id: peakMeasure.XFMR_SID,
					measure: peakMeasure.KVA_MEASURE
				});
			}
		});

		return {
			message: 'Success',
			data: {
				buckets: bucketCounts,
				month: new Date(startDate).toLocaleString('default', { month: 'long' }),
				year: startDate.getFullYear(),
				time_interval_string: `${time_of_day_from} - ${time_of_day_to}`,
				kva_rating
			}
		};
	}
};
