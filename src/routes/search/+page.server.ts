import db from '$lib/server/db';
import type { GenerateResponse, GeneratedData } from '$lib/server/response';
import {
	ev_usage_measures,
	get_upgrade_threshold,
	overloaded_kwh,
	overloaded_time,
	total_available_kwh,
	total_kwh_above_threshold,
	type DriverProfile,
	TimeInterval
} from '$lib/server/risk';
import type { Actions } from './$types';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const sid = url.searchParams.get('sid');

	console.log(sid);

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

		const profile = Number(formData.selectedProfile);
		const sid = Number(formData.t_sid);
		const evs = Number(formData.evs);
		const percentage = Number(formData.threshold_percentage);
		const interval = Number(formData.interval);
		const errors = [];

		console.log(formData.t_sid);
		console.log(Number(formData.t_sid));

		if (profile === undefined || profile === null || isNaN(profile) || profile === 0) {
			errors.push({
				field: 'selectedProfile',
				message: 'Please select a valid driver profile.'
			});
		}

		if (formData.interval === undefined || formData.interval === null || formData.interval === '') {
			errors.push({
				field: 'interval',
				message: 'Please select a valid interval.'
			});
		}

		if (sid === undefined || sid === null || isNaN(sid) || sid === 0) {
			errors.push({
				field: 'sid',
				message: 'Please enter a valid transformer SID.'
			});
		}

		if (formData.evs === undefined || formData.evs === null || isNaN(evs)) {
			errors.push({
				field: 'evs',
				message: 'Please enter a valid number of EVs.'
			});
		}

		if (percentage === undefined || percentage === null || isNaN(percentage)) {
			errors.push({
				field: 'threshold_percentage',
				message: 'Please enter a valid threshold percentage.'
			});
		}

		if (errors.length > 0) {
			return {
				message: 'Invalid field data.',
				data: null,
				errors: errors
			};
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

		const driver_profile = await db.xfmrDriverProfile.findUnique({
			where: {
				ID: profile
			}
		});

		const newMeasures = measures.map((measure) => {
			// console.log(measure);
			return [new Date(measure.UTC_TIME).getTime(), measure.KVA_MEASURE];
		});

		//console.log(sid);
		// console.log(newMeasures[0]);

		return {
			message: 'Success',
			data: {
				total_kwh_above_threshold: await total_kwh_above_threshold(measures, kvaRating, percentage),
				total_overloaded_hours: await overloaded_time(measures, kvaRating),
				total_overloaded_kwh: await overloaded_kwh(measures, kvaRating),
				upgrade_threshold: get_upgrade_threshold(kvaRating),
				total_available_kwh: await total_available_kwh(measures, kvaRating),
				xfmr_sid: sid,
				measures: newMeasures,
				driver_measures: await ev_usage_measures(measures, evs, driver_profile as DriverProfile, interval as TimeInterval),
				max: kvaRating,
				real_threshold: kvaRating * (percentage / 100),
			} as GeneratedData
		} as GenerateResponse;
	}
};
