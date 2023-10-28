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

		const errors = [];

		if (kva_rating === undefined || kva_rating === null || isNaN(kva_rating) || kva_rating === 0) {
			errors.push({
				field: 'kva_rating',
				message: 'Please select a valid KVA rating.'
			});
		}

		if (errors.length > 0) {
			return {
				message: 'Invalid field data.',
				data: null,
				errors: errors
			};
		}

		const maxMeasures = await db.xfmrMaxMeasures.findMany({
			where: {
				KVA_RATING: `${kva_rating}.0`
			}
		});

		// Instead of returning just the frequency of each bucket, return the frequency and the transformers in each bucket

		const bucketCounts = Array.from({ length: 19 }, () => ({ value: 0, transformers: [] }));
		maxMeasures.forEach((maxMeasure) => {
			const percentage = (maxMeasure?.KVA_MEASURE / parseFloat(maxMeasure?.KVA_RATING)) * 100;
			const bucket = getBucket(percentage);
			bucketCounts[bucket].value += 1;

			// Check if the transformer ID is already in the bucket
			const transformerExists = bucketCounts[bucket].transformers.some(
				(transformer) => transformer.id === maxMeasure.XFMR_SID
			);

			if (!transformerExists) {
				bucketCounts[bucket].transformers.push({
					id: maxMeasure.XFMR_SID,
					measure: maxMeasure.KVA_MEASURE
				});
			}
		});

		return {
			message: 'Success',
			data: {
				buckets: bucketCounts,
				kva_rating
			}
		};
	}
};
