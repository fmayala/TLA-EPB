import db from '$lib/server/db';
import type { GenerateResponse, GeneratedData } from '$lib/server/response';
import {
	get_upgrade_threshold,
	overloaded_kwh,
	overloaded_time,
	total_available_kwh,
	total_kwh_above_threshold
} from '$lib/server/risk';
import type { Actions } from './$types';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const sid = url.searchParams.get('sid');

	if (sid === null || sid === undefined || sid === '' || sid.match(/^[0-9]+$/) === null) {
		return {
			showGenerated: false
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
				showGenerated: false
			};
		}

		return {
			showGenerated: true
		};
	} catch (e) {
		console.log(e);
	}

	return {
		showGenerated: false
	};
}

export const actions: Actions = {
	generate: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		const profile = Number(formData.selectedProfile);
		const sid = Number(formData.sid);
		const evs = Number(formData.evs);
		const percentage = Number(formData.threshold_percentage);

		// console.log(formData)

		const errors = [];

		if (profile === undefined || profile === null || isNaN(profile)) {
			errors.push('Please select a profile');
		}

		if (sid === undefined || sid === null || isNaN(sid)) {
			errors.push('Please enter a valid SID');
		}

		if (evs === undefined || evs === null || isNaN(evs)) {
			errors.push('Please enter a valid number of electric vehicles');
		}

		if (percentage === undefined || percentage === null || isNaN(percentage)) {
			errors.push('Please enter a valid threshold percentage');
		}

		const kvaRes = await db.xfmrDimension.findUnique({
			where: {
				XFMR_SID: sid
			},
			select: {
				KVA_RATING: true
			}
		});

		const kvaRating = Number(kvaRes?.KVA_RATING);

		// HERE
		const measures = await db.xfmrMeasure.findMany({
			where: {
				XFMR_SID: sid,
				KVA_MEASURE: {
					lt: kvaRating * 4
				}
			},
			orderBy: [
				{
					MEASURE_DATE: 'asc'
				},
				{
					UTC_TIME: 'asc'
				}
			]
		});

		const newMeasures = measures.map((measure) => {
			console.log(measure);
			return [new Date(measure.UTC_TIME).getTime(), measure.KVA_MEASURE];
		});

		// const dailyData = {};

		// newMeasures.forEach((measure) => {
		// 	const date = measure.measure_date;
		// 	console.log(date);
			
		// 	if (!dailyData[date]) {
		// 		dailyData[date] = { sum: 0, count: 0 };
		// 	}
			
		// 	// Add the KVA_MEASURE to the daily total and increment the count
		// 	dailyData[date].sum += measure.kva_measure;
		// 	dailyData[date].count++;
		// 	dailyData[date].date = date;
		// });
		
		// // Calculate the average KVA_MEASURE for each day and prepare the data for the chart
		// const chartData = Object.entries(dailyData).map(([da, { sum, count, date }]) => {
		// 	// Convert the date string to a Date object
		// 	const [day, month, year] = da.split('-').map(Number);

		// 	let newDate = new Date(date);

		// 	// console.log(date.split('-'))
		// 	// Convert the date to a timestamp in milliseconds
		// 	const timestamp = new Date(year, month - 1, day).getTime();

		// 	// console.log(timestamp)
			
		// 	return [newDate.getTime(), sum / count]
		// });

		// console.log(kvaRating);

		return {
			message: 'Success',
			data: {
				total_kwh_above_threshold: total_kwh_above_threshold(measures, kvaRating, percentage),
				total_overloaded_hours: overloaded_time(measures, kvaRating),
				total_overloaded_kwh: overloaded_kwh(measures, kvaRating),
				upgrade_threshold: get_upgrade_threshold(kvaRating),
				total_available_kwh: total_available_kwh(measures, kvaRating),
				xfmr_sid: sid,
				measures: newMeasures,
				max: kvaRating
			} as GeneratedData
		} as GenerateResponse;
	}
};
