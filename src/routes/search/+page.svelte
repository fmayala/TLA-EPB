<script lang="ts">
	// export let data;
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AsyncSelect from '$lib/components/AsyncSelect.svelte';
	import { enhance } from '$app/forms';
	import dataStore from '$lib/stores/dataStore';
	import Select from '$lib/components/Select.svelte';

	export let data: PageData;
	let sid: number = $page.data.sid;

	let errors: [] = [];

	$: sid = $page.data.sid
	// $: console.log(sid);
	onMount(()=>{
		sid = $page.data.sid;
	})
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
			<Button class="ml-5 bg-epb hover:bg-epbhover">Search</Button>
		</div>
	</form>
	{#if $page.data.showGenerated}
		<form
			method="POST"
			action="?/generate"
			class="mt-5"
			use:enhance={() => {
				console.log("before req", sid);
				return async ({ result, update }) => {
					if (result.data) {
						// @ts-ignore
						$dataStore.data = result.data.data;
						if (result.data.errors)
							errors = result.data.errors;
					} else {
						errors = []
					}


					await update();
					// `result` is an `ActionResult` object
					// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
				};
			}}
		>
			<label
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>Driver Profile</label
			>
			<input class="hidden" name="t_sid" value={sid}>
			<!-- Async Select component here -->
			<AsyncSelect name="selectedProfile" placeholder="Select a profile" />
			<!-- SHow error-->
			{#if errors.map((e) => e.field).includes('selectedProfile')}
				<p class="text-red-500 text-sm mt-2">
					{errors[errors.findIndex((e) => e.field.includes('selectedProfile'))].message}
				</p>
			{/if}

			<div class="my-5" />
			<div class="flex flex-col space-y-5">
				<div class="flex flex-col">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4"
						for="ev">Number of EVs</label
					>
					<input
						value={1}
						max={10}
						min={1}
						name="evs"
						type="number"
						class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					/>
					{#if errors.map((e) => e.field).includes('evs')}
						<p class="text-red-500 text-sm mt-2">
							{errors[errors.findIndex((e) => e.field.includes('evs'))].message}
						</p>
					{/if}
				</div>
				<div class="flex flex-col">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4"
						for="threshold_percentage">Threshold Percentage</label
					>
					<input
						value={0}
						max={10}
						min={0}
						type="number"
						name="threshold_percentage"
						class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>
				<div class="flex flex-col">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="threshold_percentage">Time Interval</label
					>
					<Select
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
					/>
				</div>
			</div>
			<Button class="w-full mt-10 bg-epb hover:bg-epbhover">Generate</Button>
		</form>
	{/if}
</div>
