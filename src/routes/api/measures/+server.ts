import { json } from '@sveltejs/kit';
import db from '$lib/server/db.js';

export async function POST({ request }) {
	const formData = await request.formData();

	try {
		const chunkBlob = formData.get('chunk');
		console.log(chunkBlob);
		if (!(chunkBlob instanceof Blob)) throw new Error('Invalid chunk data');

		const chunk = await chunkBlob.text();
		const rows = chunk.trim().split('\n');

		// Prepare the data
		const dataToInsert = [];
		for (const row of rows) {
			const cells = row.split(',').map((cell) => cell.trim());

			if (!cells.length) continue; // Skip empty rows (if any

			if (
				!cells[0] ||
				!cells[1] ||
				!cells[2] ||
				!cells[3] ||
				!cells[4] ||
				!cells[5] ||
				!cells[6] ||
				!cells[7]
			) {
				continue;
			}

			let measureDate = cells[0].trim();
			let utcTime = cells[1].trim();
			const xfmrSid = parseInt(cells[2]);
			const singlePhase = parseInt(cells[3]);
			const polyPhase = parseInt(cells[4]);
			const singlePhaseInLoad = parseInt(cells[5]);
			const kwMeasure = parseFloat(cells[6]);
			const kvaMeasure = parseFloat(cells[7]);

			if (isNaN(Date.parse(measureDate)) || isNaN(Date.parse(utcTime))) {
				continue;
			}

			if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(measureDate)) {
				const utcTimestamp = new Date(
					`${measureDate.substr(0, 4)}-${measureDate.substr(4, 2)}-${measureDate.substr(
						6,
						2
					)}T${utcTime.substr(1, 5)}:00Z`
				);
				const measureTimestamp = new Date(utcTimestamp);
				measureTimestamp.setMinutes(utcTimestamp.getMinutes() - 15);
				measureDate = measureTimestamp.toISOString();
				utcTime = utcTimestamp.toISOString();
			}

			dataToInsert.push({
				MEASURE_DATE: measureDate,
				UTC_TIME: utcTime,
				SINGLE_PHASE: singlePhase,
				POLY_PHASE: polyPhase,
				SINGLE_PHASE_IN_LOAD: singlePhaseInLoad,
				KW_MEASURE: kwMeasure,
				KVA_MEASURE: kvaMeasure,
				XFMR_SID: xfmrSid // This assumes XFMR_SID is the foreign key field in xfmrMeasure table.
			});
		}

		const batchSize = 1000; // Define an appropriate batch size
		for (let i = 0; i < dataToInsert.length; i += batchSize) {
			const batch = dataToInsert.slice(i, i + batchSize);
			await db.xfmrMeasure.createMany({
				data: batch,
				skipDuplicates: true
			});
		}

		return json({ success: true });
	} catch (error) {
		console.error('Failed to save data:', error);
		return json({ error: 'Failed to save data' }, { status: 500 });
	}
}
