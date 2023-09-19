<!-- App.svelte -->
<script>
	import * as Tabs from '$lib/components/ui/tabs';
	import TransformerGenerate from '../forms/transformer-generate.svelte';
	import TransformerSearch from '../forms/transformer-search.svelte';
	import Chart from '../charts/histogram.svelte';
	import DriverDialog from '../dialogs/dialog-driver-profile.svelte';
	import TableProfiles from '../tables/table-profiles.svelte';

	/** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="main-container">
	<!-- Left Column -->
	<div class="left-column custom-scroll">
		<div class="flex flex-row">
			<img src="/EPB-2.svg" alt="EPB" />
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
				<!-- Main generation content -->
				<Tabs.Content value="search">
					<TransformerSearch form={data.search} />
                    <TransformerGenerate form={data.generate} />
				</Tabs.Content>
				<!-- Profiles content -->
				<Tabs.Content value="profiles">
					<div class="flex flex-row mt-10">
						<h1 class="ml-1 self-center text-xl font-semibold mr-auto">Driver Profiles</h1>
						<DriverDialog form={data.profiles}/>
					</div>
					<TableProfiles/>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>

	<!-- Right Column -->
	<div class="right-column custom-scroll bg-gray-300">
		<div class="p-4">
			<h1 class="text-2xl font-bold">Generated ID goes here</h1>
			<h1 class="mt-10 text-xl font-semibold">Risk Report (placeholder)</h1>
			<Chart />
			<h1 class="mt-10 text-xl font-semibold">Histogram (placeholder)</h1>
			<Chart />
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

	/* Default layout */
    .main-container {
        display: flex;
    }
    .left-column, .right-column {
        width: 50%;
        padding: 10px;
    } 

    /* Mobile layout */
    @media (max-width: 768px) {
        .left-column, .right-column {
            width: 100%;
            padding: 5px;
        }
        .main-container {
            flex-direction: column;
        }
    }
</style>
