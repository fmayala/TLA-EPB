<script lang="ts">
	// export let data;
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AsyncSelect from '$lib/components/AsyncSelectDriver.svelte';
	import { enhance } from '$app/forms';
	import dataStore from '$lib/stores/dataStore';
	import histogram from '$lib/stores/histogram';
	import Select from '$lib/components/Select.svelte';
	import AsyncSelectDriver from '$lib/components/AsyncSelectDriver.svelte';

	export let data: PageData;
	let sid: number = Number($page.url.searchParams.get('sid')) || 0;
	let ev_count: number = 0;
	let selectedYear: number = new Date().getFullYear(); // Default to current year
	let loading: boolean = false;
	let search_loading: boolean = false;

	let errors: [] = [];

	$: sid = Number($page.url.searchParams.get('sid')) || 0;

	async function searchLoading() {
		search_loading = true;

		// wait for 1 second
		await new Promise((r) => setTimeout(r, 1000));

		search_loading = false;
	}

	onMount(() => {
		sid = Number($page.url.searchParams.get('sid')) || 0;
	});
</script>

<head>
	<title>Transformer Search</title>
</head>

<!-- <TransformerSearch form={data.search} /> -->
<div class="pt-6">
	<h1 class="text-xl font-medium">Transformer Search</h1>
	<div class="mb-6 mt-6 p-4 border rounded bg-gray-100">
		<p class="mb-4">
			This tool is designed to assess provide a yearly holistical view of the 15-minute load
			measurements from a single transfomer and simulated electric vehicle usage. The tool allows
			for the analysis of the transformer load based on the following parameters:
		</p>

		<ul class="list-disc pl-5">
			<li>
				<span class="font-semibold">XFMR SID:</span> Specify a valid transformer ID generate a report.
			</li>
			<li>
				<span class="font-semibold">Number of EVs:</span> The amount of electric vehicles to simulate
				additional load on the transformers.
			</li>
			<li>
				<span class="font-semibold">Dynamic Fields if Number of EVs are Greater than 0:</span> The
				driver profile of each electric vehicle. The driver profile is used to simulate the load
				across the day based on the driving habits of the driver. See the
				<a href="/profiles" class="text-epb">Driver Profiles</a> page for more information. on the electrical
				grid, particularly on transformers of the selected KVA rating.
			</li>
			<li>
				<span class="font-semibold">Year:</span> The year to generate the report for. The report will
				only include measures from the selected year.
			</li>
			<li>
				<span class="font-semibold">Threshold Percentage:</span> Specify the load threshold percentage
				to be used in the analysis. It serves as an indicator of the transformer load and is calculated
				as the ratio of the transformer load to the transformer capacity.
			</li>
		</ul>
	</div>
	<form action="/search" method="GET" class="mt-5">
		<label
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4"
			for="ev">Transfomer ID (XFMR SID)</label
		>
		<div class="flex flex-row mt-4">
			<input
				class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
				placeholder="Enter Transformer ID (XFMR SID)"
				name="sid"
				type="number"
			/>
			<Button class="ml-5 bg-epb hover:bg-epbhover" on:click={searchLoading}>Search</Button>
		</div>
	</form>
	{#if search_loading}
		<div class="w-4 h-4 rounded-full bg-epb pulse mt-5 text-center" />
	{/if}
	{#if $page.data.showGenerated && !search_loading}
		<form
			method="POST"
			action="?/generate"
			class="mt-5"
			use:enhance={async ({ formElement, formData, action, cancel, submitter }) => {
				loading = true;

				return async ({ result, update }) => {
					if (result.data) {
						loading = false;
						// @ts-ignore
						$dataStore.data = result.data.data;
						$histogram.data = {
							buckets: [],
							bucketsEV: []
						};
						if (result.data.errors) errors = result.data.errors;
					} else {
						errors = [];
					}

					await update({ reset: false });
					// `result` is an `ActionResult` object
					// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
				};
			}}
		>
			<input class="hidden" name="t_sid" type="number" value={sid} />

			<!-- EV controls-->
			<div class="flex flex-col mb-4">
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4"
					for="ev">Number of EVs</label
				>
				<input
					bind:value={ev_count}
					on:input={() => {
						if (ev_count > 10) ev_count = 10;
					}}
					max={10}
					min={0}
					name="evs"
					type="number"
					class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
				/>
				<!-- Ignore -->
				{#if errors.map((e) => e.field).includes('evs')}
					<p class="text-red-500 text-sm mt-2">
						{errors[errors.findIndex((e) => e.field.includes('evs'))].message}
					</p>
				{/if}
			</div>

			<!-- Multiple Driver Profile AsyncSelect based on evCount -->
			{#each { length: ev_count } as _, index}
				<div class="mb-4">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>Driver Profile EV {index + 1}</label
					>
					<AsyncSelectDriver
						name={`selectedProfile${index}`}
						placeholder={`Select a profile for EV ${index + 1}`}
					/>
					<!-- Show error for each AsyncSelect -->
					{#if errors.map((e) => e.field).includes(`selectedProfile${index}`)}
						<p class="text-red-500 text-sm mt-2">
							{errors[errors.findIndex((e) => e.field.includes(`selectedProfile${index}`))].message}
						</p>
					{/if}
				</div>
			{/each}

			<div class="flex flex-col mb-4">
				<label class="text-sm font-medium mb-4" for="year">Year</label>
				<select
					bind:value={selectedYear}
					name="year"
					class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#each Array(10)
						.fill()
						.map((_, i) => new Date().getFullYear() - i) as year}
						<option value={year}>{year}</option>
					{/each}
				</select>
				{#if errors.map((e) => e.field).includes(`year`)}
					<p class="text-red-500 text-sm mt-2">
						{errors[errors.findIndex((e) => e.field.includes(`year`))].message}
					</p>
				{/if}
			</div>

			<div class="my-5" />
			<div class="flex flex-col space-y-5">
				<div class="flex flex-col">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4"
						for="threshold_percentage">Threshold Percentage</label
					>
					<input
						value={100}
						max={100}
						min={0}
						type="number"
						name="threshold_percentage"
						class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>
			</div>
			<Button
				class="w-full mt-10 bg-epb hover:bg-epbhover"
				on:click={(e) => {
					if (loading) {
						e.preventDefault();
					}
				}}
			>
				{#if loading}
					<div class="w-4 h-4 rounded-full bg-gray-200 pulse" />
				{:else}
					Generate
				{/if}
			</Button>
		</form>
	{/if}
</div>

<style>
	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.5); /* Adjust scale factor as needed */
			opacity: 0.5;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.pulse {
		animation: pulse 2s infinite;
	}
</style>
