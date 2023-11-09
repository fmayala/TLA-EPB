<script lang="ts">
	// export let data;
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import histogram from '$lib/stores/histogram';
	import dataStore from '$lib/stores/dataStore';
	import MonthPicker from '$lib/components/MonthPicker.svelte';
	import { onMount } from 'svelte';

	export let data: PageData;
	let kva_rating: number = 1;
	let timeOfDayFrom: string = '00:00';
	let timeOfDayTo: string = '15:00'; // 3 PM in 24-hour format
	let month: string = '';
	let evLoadPerTransformer: number = 1;
	let maxEvCount: number = 4; // Default value, assuming 1 transformer
	let transformerCount: number = 1; // Default to 1 transformer

	let simulate_ev_load: boolean = false;

	let errors: [] = [];

	// $: console.log(simulate_ev_load)
</script>

<head>
	<title>Transformer Search</title>
</head>

<!-- <TransformerSearch form={data.search} /> -->
<div class="pt-6">
	<h1 class="text-xl font-medium">Transformer Load Reports</h1>
	<form
		method="POST"
		action="?/generate"
		class="mt-5"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result) {
					$histogram.data = result.data.data || {};
					$dataStore.data = {};
					if (result.data.errors) errors = result.data.errors;
				}

				// console.log(result);
				await update({ reset: false });
			};
		}}
	>
		<label
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
			>Transformer KVA Rating</label
		>
		<input
			bind:value={kva_rating}
			max={10000}
			min={1}
			name="kva_rating"
			type="number"
			class="mt-4 mb-6 flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
		/>
		{#if errors.map((e) => e.field).includes(`kva_rating`)}
			<p class="text-red-500 text-sm mt-2">
				{errors[errors.findIndex((e) => e.field.includes(`kva_rating`))].message}
			</p>
		{/if}

		<div class="flex items-center space-x-2">
			<input
				type="checkbox"
				name="simulate_ev_load"
				bind:checked={simulate_ev_load}
				class="w-4 h-4 checked:bg-red-500"
			/>
			<label
				for="terms"
				id="simulate-label"
				class="text-sm font-medium leading-none cursor-pointer opacity-100"
				>Simulate EV Load Across Transformers</label
			>
		</div>

		{#if simulate_ev_load}
			<div class="mt-4">
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
					>Time of Day Start</label
				>
				<input
					bind:value={timeOfDayFrom}
					name="time_of_day_from"
					type="time"
					class="mt-4 mb-4 flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					required
				/>

				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
					>Time of Day End</label
				>
				<input
					bind:value={timeOfDayTo}
					name="time_of_day_to"
					type="time"
					class="mt-4 mb-4 flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					required
				/>

				<!-- Month Selection -->
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
					>Month</label
				>
				<MonthPicker bind:selectedMonth={month} />
				{#if errors.map((e) => e.field).includes(`month`)}
					<p class="text-red-500 text-sm mt-2 mb-2">
						{errors[errors.findIndex((e) => e.field.includes(`month`))].message}
					</p>
				{/if}

				<!-- EV Load per Transformer -->
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
					>Max EVs per Transformer</label
				>
				<input
					bind:value={evLoadPerTransformer}
					name="ev_load"
					type="number"
					min="1"
					max="4"
					class="mt-4 flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					required
				/>
			</div>
		{/if}

		<Button class="w-full mt-10 bg-epb hover:bg-epbhover">
			<!-- {#if loading} -->
			<!-- <div class="w-4 h-4 rounded-full bg-gray-200 pulse" /> -->
			<!-- {:else} -->
			Generate
			<!-- {/if} -->
		</Button>
	</form>
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
