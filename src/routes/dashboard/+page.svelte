<!-- App.svelte -->
<script lang="ts">
	import logo from '$lib/assets/epb-2.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import TransformerSearch from '../../forms/transformer-search.svelte';
    import type { Page } from '@sveltejs/kit';
    
    export let data: Page;
</script>

<div class="flex h-screen">
	<!-- Left Column -->
	<div class="w-1/2 custom-scroll px-10 py-5">
		<div class="flex flex-row">
			<img src={logo} alt="EPB logo" />
			<div class="self-center ml-4">
				<h1 class="text-2xl font-bold">Transformer Loading Analysis</h1>
			</div>
		</div>
		<div class="p-4">
			<!-- <h1 class="text-xl font-bold mt-10">Transformer Search</h1> -->
			<Tabs.Root value="search" class="w-full mt-5">
				<Tabs.List class="bg-white space-x-5">
					<Tabs.Trigger
						value="search"
						class="justify-normal items-start p-0 text-base">Transformer Search</Tabs.Trigger
					>
					<Tabs.Trigger
						value="profiles"
						class="justify-normal items-start p-0 text-base">Profiles</Tabs.Trigger
					>
				</Tabs.List>
				<Tabs.Content value="search">
					<div class="flex flex-row mt-5">
						<Input placeholder="Enter Transformer ID (XFMR SID)" />
						<Button href="" class="ml-5 bg-epb hover:bg-epbhover">Search</Button>
					</div>
                    <TransformerSearch form={data.form} />
				</Tabs.Content>
				<Tabs.Content value="profiles">Change your password here.</Tabs.Content>
			</Tabs.Root>
			<!-- Your content here -->
			<!-- {#each Array(100) as _, i}
				<p>Left Content {i + 1}</p>
			{/each} -->
		</div>
	</div>

	<!-- Right Column -->
	<div class="w-1/2 bg-gray-300 custom-scroll px-10 py-5">
		<div class="p-4">
			<h1 class="text-xl font-bold">Right Column</h1>
			<!-- Your content here -->
			{#each Array(100) as _, i}
				<p>Right Content {i + 1}</p>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Add this style to ensure scrolling works as expected */
	.custom-scroll {
		overflow-y: auto;
		height: 100vh;
	}

	/* Webkit-based browsers */
	.custom-scroll::-webkit-scrollbar {
		width: 8px; /* Adjust scrollbar width */
	}
	.custom-scroll::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.5); /* Adjust scrollbar thumb color and opacity */
		border-radius: 3px;
	}
	.custom-scroll::-webkit-scrollbar-track {
		background: transparent; /* Make the scrollbar track transparent */
	}
	.custom-scroll::-webkit-scrollbar-button {
		display: none; /* Hide scrollbar buttons */
	}

	/* Firefox */
	.custom-scroll {
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 0, 0, 0.5) transparent; /* Adjust scrollbar thumb color and make track transparent */
	}
</style>
