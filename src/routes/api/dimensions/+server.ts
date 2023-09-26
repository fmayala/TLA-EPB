import { json } from '@sveltejs/kit';
import db from '$lib/server/db.js';

// TODO: Fix skipping last row of data in a chunk

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

		const xfmrDimensions = [];

		for (const row of rows) {
			const cells = row.split(',').map((cell) => cell);

			console.log(row);

			if (!cells.length) continue; // Skip empty rows (if any

			if (
				!cells[0] ||
				!cells[1] ||
				!cells[2] ||
				!cells[3] ||
				!cells[4] ||
				!cells[5] ||
				!cells[6] ||
				!cells[7] ||
				!cells[8] ||
				!cells[9]
			) {
				continue;
			}

			const xfmrSid = cells[0].trim();
			const effectiveStartDate = cells[1].trim();
			const effectiveEndDate = cells[2].trim();
			const updateDate = cells[3].trim();
			const current_indicator = cells[4].replace(/[^a-zA-Z0-9]/g, '');
			const gis_bank_indicator = cells[5].trim();
			const gis_identifier = cells[6].trim();
			const xfmr_number = cells[7].trim();
			const kva_rating = cells[8].trim();
			const phase = cells[9].trim();

			// Skip processing the header row
			if (
				isNaN(Date.parse(effectiveEndDate)) ||
				isNaN(Date.parse(effectiveStartDate)) ||
				isNaN(Date.parse(updateDate))
			) {
				continue;
			}

			xfmrDimensions.push({
				XFMR_SID: parseInt(xfmrSid),
				EFFECTIVE_START_DATE: new Date(effectiveStartDate),
				EFFECTIVE_END_DATE: new Date(effectiveEndDate),
				UPDATE_DATE: new Date(updateDate),
				CURRENT_INDICATOR: current_indicator,
				GIS_BANK_INDICATOR: parseInt(gis_bank_indicator),
				GIS_IDENTIFIER: parseInt(gis_identifier),
				XFMR_NUMBER: xfmr_number,
				KVA_RATING: kva_rating,
				PHASE: phase
			});
		}

		// Insert all rows in a single transaction
		await db.xfmrDimension.createMany({
			data: xfmrDimensions,
			skipDuplicates: true, // Optionally skip duplicate records, adjust as per your requirement
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to save data:', error);
		return json({ error: 'Failed to save data' }, { status: 500 });
	}
}