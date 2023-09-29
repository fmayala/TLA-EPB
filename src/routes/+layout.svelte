<!-- layouts/main-layout.svelte -->
<script lang="ts">
	import '../app.postcss';
	import dataStore from '$lib/stores/dataStore';
	import { onMount } from 'svelte';
	import { goto, onNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';
	// import ApexCharts from 'apexcharts';
	// import { chart } from "svelte-apexcharts";

	export let data;

	let myChart: any;

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
	// Define the chart options
	var options = {
		series: [
			{
				data: []
			}
		],
		chart: {
			id: 'area-datetime',
			type: 'area',
			animations: {
				enabled: false
			},
			height: 350,
			stacked: false,
			zoom: {
				autoScaleYaxis: true
			}
		},
		dataLabels: {
			enabled: false
		},
		markers: {
			size: 0,
			style: 'hollow'
		},
		xaxis: {
			type: 'datetime',
			tickAmount: 6
		},
		tooltip: {
			x: {
				format: 'dd MMM yyyy'
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				inverseColors: false,
				opacityFrom: 0.75, // Set to a value less than 1 to allow overlay
				opacityTo: 1, // Set to a value less than 1 to allow overlay
				stops: [0, 100]
			}
		},
		stroke: {
			width: 2.5,
			opacity: 0.6
		}
	};

	onMount(async () => {
		const ApexCharts = (await import('apexcharts')).default;
		myChart = new ApexCharts(document.querySelector('#chart'), options);
		myChart.render();
	});

	// Reactive statement to handle data update
	$: if ($dataStore.data && $dataStore.data.measures && $dataStore.data.driver_measures) {
		// Extracting the measures data
		let measures = $dataStore.data.measures;
		let ev_measures = $dataStore.data.driver_measures;

		// Get the timestamp of the first data point
		const firstTimestamp = measures[0][0];

		// Create a Date object from the timestamp
		const firstDate = new Date(firstTimestamp);

		// Set the Date object to the start of the year
		firstDate.setMonth(0); // January
		firstDate.setDate(1); // 1st of the month
		firstDate.setHours(0, 0, 0, 0); // Start of the day

		// Get the timestamp for the start of the year
		const startOfYearTimestamp = firstDate.getTime();

		// Validate if measures array has data
		if (measures.length > 0) {
			// If the chart is already rendered, update the series with the complete data
			if (myChart) {
				// Update the y-axis max value
				myChart.updateOptions({
					xaxis: {
						min: startOfYearTimestamp,
						labels: {
							// format: 'MMM yyyy'
						}
					},
					yaxis: {
						min: 0,
						max: $dataStore.data.max,
						tickAmount: 7,
						labels: {
							formatter: function (val: number) {
								return `${val.toFixed(1)} KVA`;
							}
						}
					},
					annotations: {
						yaxis: [
							{
								y: $dataStore.data.real_threshold,
								borderColor: '#999',
								label: {
									show: true,
									text: 'KVA Threshold',
									position: 'center',
									style: {
										color: '#fff',
										background: '#2C6EBF'
									}
								}
							}
						]
					}
				});

				myChart.updateSeries([
					{
						data: ev_measures,
						name: 'EV Usage',
						color: '#FFA500',
						fill: {
							opacity: 0.6
						}
					},
					{
						data: measures,
						name: 'Normal Usage',
						color: '#2C6EBF',
						fill: {
							opacity: 1
						}
					}
				]);

				// zoom chart to beginning and end of data

				// console.log(new Date(measures[0][0]).getTime());
				myChart.zoomX(startOfYearTimestamp, measures[measures.length - 1][0]);
			}
		}
	}
</script>

<div class="bg-epbthird h-14 relative">
    <div class="flex flex-row items-center h-full">
        <img class="ml-8 mr-8 cursor-pointer" src="/epb.svg" alt="EPB" height="80" width="80" on:click={()=>{
            goto('/');
        }} />
        <div class="flex items-center space-x-4 h-full text-white text-xs tracking-widest">
            <div class="flex flex-col justify-between h-full w-24 text-center">
                <a
                    href="/search"
                    class="font-semibold cursor-pointer mt-6"
                >SEARCH</a>
                {#if data.pathname.includes('/search')}
                    <div class="bg-epbgreen h-1 w-20 mx-auto"></div>
                {/if}
            </div>
            <div class="flex flex-col justify-between h-full w-24 text-center">
                <a
                    href="/profiles"
                    class="font-semibold cursor-pointer mt-6"
                >PROFILES</a>
                {#if data.pathname.includes('/profiles')}
                    <div class="bg-epbgreen h-1 w-20 mx-auto"></div>
                {/if}
            </div>
        </div>
    </div>
</div>
<div class="main-container">
	<!-- Left Column -->
	<div class="left-column custom-scroll shadow-md">
		{#key data.pathname}
			<div in:fade={{ duration: 300 }} class="px-6">
				<slot />
			</div>
		{/key}
	</div>

	<!-- Right Column -->
	<div class="right-column custom-scroll bg-epbsecond">
		<!-- Check if dataStore.data is available -->
		{#if $dataStore.data}
			<!-- Display the transformer SID -->
			<h1 class="text-xl font-bold mb-6">Transformer SID: {$dataStore.data.xfmr_sid}</h1>

			<div id="chart" />
			<!-- Display other data in a markdown-like format -->
			<div class="grid grid-cols-1 gap-6">
				<div class="p-4 rounded">
					<p class="text-base font-semibold mb-2">Total kWh Above Threshold</p>
					<p class="text-xl">{$dataStore.data.total_kwh_above_threshold}</p>
				</div>
				<div class="px-4 py-2 rounded">
					<p class="text-base font-semibold mb-2">Total Overloaded Hours</p>
					<p class="text-xl">{$dataStore.data.total_overloaded_hours}</p>
				</div>
				<div class="p-4 rounded">
					<p class="text-base font-semibold mb-2">Total Overloaded kWh</p>
					<p class="text-xl">{$dataStore.data.total_overloaded_kwh}</p>
				</div>
				<div class="p-4 rounded">
					<p class="text-base font-semibold mb-2">Upgrade Threshold</p>
					<p class="text-xl">{$dataStore.data.upgrade_threshold}</p>
				</div>
				<div class="p-4 rounded">
					<p class="text-base font-semibold mb-2">Total Available kWh</p>
					<p class="text-xl">{$dataStore.data.total_available_kwh}</p>
				</div>
			</div>
		{:else}{/if}
	</div>
</div>

<style>
	/* Add this style to ensure scrolling works as expected */
	.custom-scroll {
		overflow-y: auto;
		height: calc(100vh - 56px);
	}

	/* Webkit-based browsers */
	.custom-scroll::-webkit-scrollbar {
		width: 8px; /* Adjust scrollbar width */
	}
	.custom-scroll::-webkit-scrollbar-thumb {
		background: rgba(
			150,
			150,
			150,
			0.3
		); /* Adjust scrollbar thumb color and opacity for a subtler appearance */
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
		scrollbar-color: rgba(150, 150, 150, 0.3) transparent; /* Adjust scrollbar thumb color and make track transparent for a subtler appearance */
	}

	/* Default layout */
	.main-container {
		display: flex;
	}
	.left-column,
	.right-column {
		width: 50%;
		padding: 10px;
	}

	/* Mobile layout */
	@media (max-width: 768px) {
		.left-column,
		.right-column {
			width: 100%;
			padding: 5px;
		}
		.main-container {
			flex-direction: column;
		}
	}
</style>
