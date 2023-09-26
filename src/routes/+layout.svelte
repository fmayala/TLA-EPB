<!-- layouts/main-layout.svelte -->
<script lang="ts">
	import '../app.postcss';
	import dataStore from '$lib/stores/dataStore';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';
	// import ApexCharts from 'apexcharts';
	// import { chart } from "svelte-apexcharts";

	export let data;

	let myChart;

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// let options = {
	// 	series: [
	// 		{
	// 			name: 'Monthly KVA Measures',
	// 			data: []
	// 		}
	// 	],
	// 	chart: {
	// 		type: 'area',
	// 		stacked: false,
	// 		height: 350,
	// 		zoom: {
	// 			type: 'x',
	// 			enabled: true,
	// 			autoScaleYaxis: true
	// 		},
	// 		toolbar: {
	// 			autoSelected: 'zoom'
	// 		}
	// 	},
	// 	dataLabels: {
	// 		enabled: false
	// 	},
	// 	markers: {
	// 		size: 0
	// 	},
	// 	title: {
	// 		text: 'Monthly KVA Measures',
	// 		align: 'left'
	// 	},
	// 	fill: {
	// 		type: 'gradient',
	// 		gradient: {
	// 			shadeIntensity: 1,
	// 			inverseColors: false,
	// 			opacityFrom: 0.5,
	// 			opacityTo: 0,
	// 			stops: [0, 90, 100]
	// 		}
	// 	},
	// 	yaxis: {
	// 		labels: {
	// 			formatter: function (val) {
	// 				return val.toFixed(1);
	// 			}
	// 		},
	// 		title: {
	// 			text: 'KVA Measures'
	// 		}
	// 	},
	// 	xaxis: {
	// 		type: 'datetime',
	// 		title: {
	// 			text: 'Month'
	// 		}
	// 	},
	// 	tooltip: {
	// 		shared: false,
	// 		y: {
	// 			formatter: function (val) {
	// 				return val.toFixed(1);
	// 			}
	// 		},
	// 		x: {
	// 			format: 'MMMM yyyy'
	// 		}
	// 	}
	// };

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
			height: 350,
			zoom: {
				autoScaleYaxis: true
			}
		},
		annotations: {
			// xaxis: [
			// 	{
			// 		x: new Date('14 Nov 2012').getTime(),
			// 		borderColor: '#999',
			// 		yAxisIndex: 0,
			// 		label: {
			// 			show: true,
			// 			text: 'Rally',
			// 			style: {
			// 				color: '#fff',
			// 				background: '#775DD0'
			// 			}
			// 		}
			// 	}
			// ]
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
			min: new Date('01 Mar 2012').getTime(),
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
				opacityFrom: 0.7,
				opacityTo: 0.9,
				stops: [0, 100]
			}
		}
	};

	onMount(async () => {
		const ApexCharts = (await import('apexcharts')).default;
		myChart = new ApexCharts(document.querySelector('#chart'), options);
		myChart.render();
	});

	// Reactive statement to handle data update
	$: if ($dataStore.data && $dataStore.data.measures) {
		// Extracting the measures data
		let measures = $dataStore.data.measures;
		console.log(measures);

		// Validate if measures array has data
		if (measures.length > 0) {
			// If the chart is already rendered, update the series with the complete data
			if (myChart) {
				// Update the y-axis max value
				myChart.updateOptions({
					yaxis: {
						min: 0,
						max: $dataStore.data.max + 5,
						tickAmount: 5,
						forceNiceScale: true,
						labels: {
							formatter: function (val) {
								return val.toFixed(1);
							}
						},
					},
					annotations: {
						yaxis: [
							{
								y: $dataStore.data.max,
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

				myChart.updateSeries([{ data: measures, name: 'Normal Usage', color: '#2C6EBF' }]);

				// zoom chart to beginning and end of data

				console.log(new Date(measures[0][0]).getTime());
				myChart.zoomX(measures[0][0], measures[measures.length - 1][0]);
			}
		}
	}
</script>

<div class="main-container">
	<!-- Left Column -->
	<div class="left-column custom-scroll shadow-md">
		<div class="flex flex-row px-6">
			<img src="/EPB-2.svg" alt="EPB" />
			<div class="self-center ml-4">
				<h1 class="text-2xl font-bold">Transformer Loading Analysis</h1>
			</div>
		</div>
		<div class="flex flex-row space-x-4 mt-10 px-6">
			<a
				href="/search"
				class="font-semibold text-xl cursor-pointer"
				class:text-epb={data.pathname.includes('/search')}
				class:text-gray-300={!data.pathname.includes('/search')}>Transformer Search</a
			>
			<a
				href="/profiles"
				class="font-semibold text-xl cursor-pointer"
				class:text-epb={data.pathname.includes('/profiles')}
				class:text-gray-300={!data.pathname.includes('/profiles')}>Profiles</a
			>
			<a
				href="/tools"
				class="font-semibold text-xl cursor-pointer"
				class:text-epb={data.pathname.includes('/tools')}
				class:text-gray-300={!data.pathname.includes('/tools')}>Tools</a
			>
		</div>
		{#key data.pathname}
			<div in:fade={{ duration: 300 }} class="px-6">
				<slot />
			</div>
		{/key}
	</div>

	<!-- Right Column -->
	<div class="right-column custom-scroll bg-gray-100">
		<!-- Check if dataStore.data is available -->
		{#if $dataStore.data}
			<!-- Display the transformer SID -->
			<h1>Transformer SID: {$dataStore.data.xfmr_sid}</h1>

			<!-- Display other data in a markdown-like format -->
			<!-- <div class="flex flex-col justify-center mt-6">
				<div class="flex flex-col">
					<p>Total kWh Above Threshold</p>
					<p>
						{$dataStore.data.total_kwh_above_threshold}
					</p>
				</div>
				<div class="flex flex-col">
					<p>Total Overloaded Hours</p>
					<p>
						{$dataStore.data.total_overloaded_hours}
					</p>
				</div>
				<div class="flex flex-col">
					<p>Total Overloaded kWh</p>
					<p>
						{$dataStore.data.total_overloaded_kwh}
					</p>
				</div>
				<div class="flex flex-col">
					<p>Upgrade Threshold</p>
					<p>
						{$dataStore.data.upgrade_threshold}
					</p>
				</div>
				<div class="flex flex-col">
					<p>Total Available kWh</p>
					<p>
						{$dataStore.data.total_available_kwh}
					</p>
				</div>
			</div>

			<div class="flex flex-col" />
		{:else}
			<!-- Display a message when no data is available -->
			<!-- <p>No Data Available</p> -->
		{/if}
		<div id="chart" />
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
