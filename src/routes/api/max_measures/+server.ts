import { json } from '@sveltejs/kit';
import db from '$lib/server/db.js';

export async function POST({ request }) {
	const formData = await request.formData();

	try {
		// Extract the chunk from the form data
		const chunkBlob = formData.get('chunk');
		if (!(chunkBlob instanceof Blob)) throw new Error('Invalid chunk data');

		// Convert the Blob to a string
		const chunk = await chunkBlob.text();

		// Split the chunk into rows and parse each row
		const rows = chunk.trim().split('\n');

		const xfmrMaxMeasures = [];

		for (const row of rows) {
			const cells = row.split(',').map((cell) => cell.trim());

			const xfmrSid = cells[0].trim();
			const KVA_RATING = cells[1].trim();
			const KVA_MEASURE = cells[2].trim();

            // Skip processing the header row
            if (isNaN(parseInt(xfmrSid))) {
                continue;
            }

			xfmrMaxMeasures.push({
                XFMR_SID: parseInt(xfmrSid) || 0,
				KVA_RATING: KVA_RATING,
                KVA_MEASURE: parseInt(KVA_MEASURE),
			});
		}

		// Insert all rows in a single transaction
		await db.xfmrMaxMeasures.createMany({
			data: xfmrMaxMeasures,
			skipDuplicates: true, // Optionally skip duplicate records, adjust as per your requirement
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to save data:', error);
		return json({ error: 'Failed to save data' }, { status: 500 });
	}
}