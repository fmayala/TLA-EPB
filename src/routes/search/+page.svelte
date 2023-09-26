<script lang="ts">
	// export let data;
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AsyncSelect from '$lib/components/AsyncSelect.svelte';
	import { enhance } from '$app/forms';
	import dataStore from '$lib/stores/dataStore';

	export let data: PageData;

	let sid: number;

	$: sid = $page.data.sid;

	onMount(() => {
		console.log(data);
	});
</script>


<!-- <TransformerSearch form={data.search} /> -->
<div>
	<form action="/search" method="GET" class="mt-5">
		<div class="flex flex-row">
			<input
				class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
				placeholder="Enter Transformer ID (XFMR SID)"
				name="sid"
			/>
			<Button class="ml-5 bg-epb hover:bg-epbhover">Search</Button>
		</div>
	</form>
	{#if $page.data.showGenerated}
		<form method="POST" action="?/generate" class="mt-5" use:enhance={() => {
			return async ({ result, update }) => {
				// @ts-ignore
				$dataStore.data = result.data.data;
				// console.log(result.data.data);

				await update();
				// `result` is an `ActionResult` object
				// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
			};
		}}>
			<label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Driver Profile</label>
			<input
				class="hidden"
				name="sid"
				value={$page.url.searchParams.get('sid')}
			/>
			<!-- Async Select component here -->
			<AsyncSelect name="selectedProfile" placeholder="Select a profile" />
			
			<div class="my-5" />
			<div class="flex flex-row space-x-5">
				<div class="flex flex-col">
					<label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4" for="ev">Number of EVs</label>
					<input value={0} max={10} min={0} name="ev" class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50" />
				</div>
				<div class="flex flex-col">
					<label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-4" for="threshold_percentage">Threshold Percentage</label>
					<input value={0} max={10} min={0} name="threshold_percentage" class="flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50" />
				</div>
				</div>
			<Button class="w-full mt-10 bg-epb hover:bg-epbhover">Generate</Button>
		</form>
	{/if}
</div>