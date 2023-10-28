<script lang="ts">
	// export let data;
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AsyncSelect from '$lib/components/AsyncSelect.svelte';
	import { enhance } from '$app/forms';
	import dataStore from '$lib/stores/dataStore';
	import histogram from '$lib/stores/histogram';
	import Select from '$lib/components/Select.svelte';

	export let data: PageData;
	let sid: number = Number($page.url.searchParams.get('sid')) || 0;
	let loading: boolean = false;
	let search_loading: boolean = false;
	let ev_count: number = 0;

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
	<form action="/search" method="GET" class="mt-5">
		<div class="flex flex-row">
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
						$histogram.data = {};
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
					<AsyncSelect
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
				<!-- <div class="flex flex-col">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="threshold_percentage">Time Interval</label
					>
					<!-- <Select
						name="interval"
						placeholder="Select an interval"
						options={[
							{
								ID: 1,
								NAME: 'Early Morning (12 AM to 6 AM)'
							},
							{
								ID: 2,
								NAME: 'Morning (6 AM to 12 PM)'
							},
							{
								ID: 3,
								NAME: 'Afternoon (12 PM to 6 PM)'
							},
							{
								ID: 4,
								NAME: 'Evening (6 PM to 12 AM)'
							}
						]}
					/> -->
					<!-- Show error for Select 
					{#if errors.map((e) => e.field).includes(`interval`)}
						<p class="text-red-500 text-sm mt-2">
							{errors[errors.findIndex((e) => e.field.includes(`interval`))].message}
						</p>
					{/if}
				</div> -->
			</div>
			<Button class="w-full mt-10 bg-epb hover:bg-epbhover">
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
