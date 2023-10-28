<script lang="ts">
	// export let data;
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import histogram from '$lib/stores/histogram';
	import dataStore from '$lib/stores/dataStore';

	export let data: PageData;
	let kva_rating: number = 1;
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
                }

                // console.log(result);
				await update();
			};
		}}
	>
		<label
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
			>Transformer Max KVA Rating</label
		>
		<input
			bind:value={kva_rating}
			max={10000}
			min={1}
			name="kva_rating"
			type="number"
			class="mt-4 flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
		/>
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
