<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Progress } from '$lib/components/ui/progress';
	import type { PageData } from './$types';
	export let data: PageData;

	enum ENDPOINT {
		DIMENSION = '/api/dimensions',
		MEASURES = '/api/measures',
		MAX_MEASURES = '/api/max_measures'
	}

	let selectedFileMeasures: File | null = null;
	let selectedFileDimensions: File | null = null;
	let selectedFileMaxMeasure: File | null = null;

	let uploadingFile: File | null = null;

	let chunkSizeMB: number = 10; // default value for chunk size in MB

	// Function to store the selected file
	function handleFileSelectionMeasures(event: Event) {
		const input = event.target as HTMLInputElement;
		selectedFileMeasures = input.files?.[0] || null;
	}
	// Function to store the selected file
	function handleFileSelectionDimensions(event: Event) {
		const input = event.target as HTMLInputElement;
		selectedFileDimensions = input.files?.[0] || null;
	}
	// Function to store the selected file
	function handleFileSelectionMaxMeasure(event: Event) {
		const input = event.target as HTMLInputElement;
		selectedFileMaxMeasure = input.files?.[0] || null;
	}

	let uploadProgress: number | null = null;
	let uploadError: string | null = null;
	let uploading: boolean = false;

	async function handleFileUpload(file: File | null = null, endpoint: ENDPOINT) {
		uploadProgress = null; // Reset upload progress
		uploadingFile = file; // Store the file that is being uploaded
		uploading = true; // Set uploading state to true

		if (!file) {
			uploading = false; // Set uploading state to false
			return;
		};

		uploadProgress = 0; // Initialize upload progress
		uploadError = null; // Reset any previous error

		const chunkSize = chunkSizeMB * 1024 * 1024; // converting MB to bytes
		let offset = 0;

		while (offset < file.size) {
			try {
				// Ensure that the chunk size does not exceed the remaining file size
				const actualChunkSize = Math.min(chunkSize, file.size - offset);
				const chunk = file.slice(offset, offset + actualChunkSize);
				const formData = new FormData();
				formData.append('chunk', chunk);
				formData.append('offset', offset.toString());
				formData.append('filename', file.name);

				await fetch(endpoint, {
					method: 'POST',
					body: formData
				})
					.then((response) => {
						if (!response.ok) {
							throw new Error('Failed to upload chunk');
						}
						return response.json();
					})
					.then((result) => {
						if (result.error) {
							throw new Error(result.error);
						}
						// Update offset by the actual chunk size
						offset += actualChunkSize;
						uploadProgress = (offset / file.size) * 100; // Update upload progress
					});
			} catch (error: any) {
				uploadError = error.toString() || 'Failed to upload file'; // Set the error message
				break;
			}
		}
		
		uploading = false; // Set uploading state to false
	}
</script>

<div class="my-10 bg-white">
	<Tabs.Root value="dimension_import" class="my-6">
		<Tabs.List class="grid w-full grid-cols-3 mb-6">
			<Tabs.Trigger value="dimension_import">Dimensions</Tabs.Trigger>
			<Tabs.Trigger value="maximum_import">Maximum Measures</Tabs.Trigger>
			<Tabs.Trigger value="measure_import">Measures</Tabs.Trigger>
		</Tabs.List>

		{#if uploadProgress !== null}
			<div class="my-6 space-y-3">
				{#if uploadProgress === 100}
					<p>Upload complete!</p>
				{:else}
					<p>Uploading {uploadingFile?.name}</p>
				{/if}
				<Progress value={uploadProgress ? uploadProgress : 0} max={100} class="w-full" />
			</div>
		{/if}
		{#if uploadError}
			<div class="my-6 text-red-600">
				Error uploading: {uploadError}
			</div>
		{/if}

		<Tabs.Content value="dimension_import">
			<h1 class="text-2xl font-semibold mb-4">Transformer Dimensions Import</h1>
			<p class="mb-4">Below is a tool for uploading data identifying transformers.</p>
			<p class="mb-4 text-sm text-gray-600">
				<strong>Note:</strong> The data should ideally be in <code>.csv</code> or <code>.txt</code> file
				format.
			</p>
			<label class="block my-6">
				<span class="text-sm text-gray-600"
					>Chunk Size: {chunkSizeMB} MB (the amount of data we send to the server in each request)</span
				>
				<input
					type="range"
					min="10"
					max="100"
					bind:value={chunkSizeMB}
					class="mt-1 block w-full cursor-pointer"
				/>
			</label>

			<div class="flex flex-row">
				<input
					type="file"
					accept=".csv, .txt"
					on:change={handleFileSelectionDimensions}
					class="mb-4 w-full"
				/>
				<Button
					on:click={() => handleFileUpload(selectedFileDimensions, ENDPOINT.DIMENSION)}
					disabled={uploading}
					class="bg-epb hover:bg-epbhover mb-6">Upload File</Button
				>
			</div>

			<h2 class="text-xl font-semibold mb-2">Data Format</h2>

			<p class="mb-4">Your data should typically look like this:</p>

			<pre class="bg-gray-100 rounded mb-4 py-2 flex items-center justify-left pl-4">
        		<code>113161, 20101125, 20171004, 20171005, N, 332037, 3320371, P13611, 50.0, AB</code>
    		</pre>

			<p class="mb-4">Each value in the row maps to the following columns:</p>

			<table class="bg-white border border-gray-200 mb-4 w-1/2">
				<tbody>
					<tr>
						<th class="py-2 border-b text-sm">XFMR_SID</th>
						<td class="py-2 border-b text-sm">113161</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">EFFECTIVE_START_DATE</th>
						<td class="py-2 border-b text-sm">20101125</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">EFFECTIVE_END_DATE</th>
						<td class="py-2 border-b text-sm">20171004</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">UPDATE_DATE</th>
						<td class="py-2 border-b text-sm">20171005</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">CURRENT_INDICATOR</th>
						<td class="py-2 border-b text-sm">N</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">GIS_BANK_INDICATOR</th>
						<td class="py-2 border-b text-sm">332037</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">GIS_IDENTIFIER</th>
						<td class="py-2 border-b text-sm">3320371</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">XFMR_NUMBER</th>
						<td class="py-2 border-b text-sm">P13611</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">KVA_RATING</th>
						<td class="py-2 border-b text-sm">50.0</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">PHASE</th>
						<td class="py-2 border-b text-sm">AB</td>
					</tr>
				</tbody>
			</table>

			<p>Please ensure that your data conforms to this format before uploading.</p>
		</Tabs.Content>
		<Tabs.Content value="maximum_import">
			<h1 class="text-2xl font-semibold mb-4">Transformer Maximum Measures Import</h1>
			<p class="mb-4">Below is a tool for uploading max measures of transformers</p>
			<p class="mb-4 text-sm text-gray-600">
				<strong>Note:</strong> The data should ideally be in <code>.csv</code> or <code>.txt</code> file
				format.
			</p>
			<label class="block my-6">
				<span class="text-sm text-gray-600"
					>Chunk Size: {chunkSizeMB} MB (the amount of data we send to the server in each request)</span
				>
				<input
					type="range"
					min="50"
					max="200"
					bind:value={chunkSizeMB}
					class="mt-1 block w-full cursor-pointer"
				/>
			</label>

			<div class="flex flex-row">
				<input
					type="file"
					accept=".csv, .txt"
					on:change={handleFileSelectionMaxMeasure}
					class="mb-4 w-full"
				/>
				<Button
					on:click={() => handleFileUpload(selectedFileMaxMeasure, ENDPOINT.MAX_MEASURES)}
					disabled={uploading}
					class="bg-epb hover:bg-epbhover mb-6">Upload File</Button
				>
			</div>

			<h2 class="text-xl font-semibold mb-2">Data Format</h2>

			<p class="mb-4">Your data should typically look like this:</p>

			<pre class="bg-gray-100 rounded mb-4 py-2 flex items-center justify-left pl-4">
        		<code>68766, 5.0, 0.968</code>
    		</pre>

			<p class="mb-4">Each value in the row maps to the following columns:</p>

			<table class="bg-white border border-gray-200 mb-4 w-1/2">
				<tbody>
					<tr>
						<th class="py-2 border-b text-sm">XFMR_SID</th>
						<td class="py-2 border-b text-sm">68766</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">KVA_RATING</th>
						<td class="py-2 border-b text-sm">5.0</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">KVA_MEASURE</th>
						<td class="py-2 border-b text-sm">0.968</td>
					</tr>
				</tbody>
			</table>

			<p>Please ensure that your data conforms to this format before uploading.</p>
		</Tabs.Content>
		<Tabs.Content value="measure_import">
			<h1 class="text-2xl font-semibold mb-4">Transformer Interval Upload</h1>
			<p class="mb-4">Below is a tool for uploading 15-minute interval data for transformers.</p>
			<p class="mb-4 text-sm text-gray-600">
				<strong>Note:</strong> The data should ideally be in <code>.csv</code> or <code>.txt</code> file
				format.
			</p>
			<label class="block my-6">
				<span class="text-sm text-gray-600"
					>Chunk Size: {chunkSizeMB} MB (the amount of data we send to the server in each request)</span
				>
				<input
					type="range"
					min="50"
					max="200"
					bind:value={chunkSizeMB}
					class="mt-1 block w-full cursor-pointer"
				/>
			</label>

			<div class="flex flex-row">
				<input
					type="file"
					accept=".csv, .txt"
					on:change={handleFileSelectionMeasures}
					class="mb-4 w-full"
				/>
				<Button
					on:click={() => handleFileUpload(selectedFileMeasures, ENDPOINT.MEASURES)}
					disabled={uploading}
					class="bg-epb hover:bg-epbhover mb-6">Upload File</Button
				>
			</div>

			<h2 class="text-xl font-semibold mb-2">Data Format</h2>

			<p class="mb-4">Your data should typically look like this:</p>

			<pre class="bg-gray-100 rounded mb-4 py-2 flex items-center justify-left pl-4">
        		<code>20201210, "22:30", 127638, 0, 1, 0, 1, 4.906, 5.013</code>
    		</pre>

			<p class="mb-4">Each value in the row maps to the following columns:</p>

			<table class="bg-white border border-gray-200 mb-4 w-1/2">
				<tbody>
					<tr>
						<th class="py-2 border-b text-sm">MEASURE_DATE</th>
						<td class="py-2 border-b text-sm">20201210</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">UTC_TIME</th>
						<td class="py-2 border-b text-sm">"22:30"</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">XFMR_SID</th>
						<td class="py-2 border-b text-sm">127638</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">SINGLE_PHASE</th>
						<td class="py-2 border-b text-sm">0</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">POLY_PHASE</th>
						<td class="py-2 border-b text-sm">1</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">SINGLE_PHASE_IN_LOAD</th>
						<td class="py-2 border-b text-sm">0</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">KW_MEASURE</th>
						<td class="py-2 border-b text-sm">4.906</td>
					</tr>
					<tr>
						<th class="py-2 border-b text-sm">KVA_MEASURE</th>
						<td class="py-2 border-b text-sm">5.013</td>
					</tr>
				</tbody>
			</table>

			<p>Please ensure that your data conforms to this format before uploading.</p>
		</Tabs.Content>
	</Tabs.Root>
</div>
