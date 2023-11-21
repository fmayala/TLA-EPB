<!-- layouts/main-layout.svelte -->
<script lang="ts">
	import '../app.postcss';
	import dataStore from '$lib/stores/dataStore';
	import { goto, onNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import histogram from '$lib/stores/histogram';
	import Chart from '$lib/components/Chart.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Excel from 'exceljs';

	export let data;

	let myChartRef: any;
	let chartRef: any;

	let series_data: any[] = [];
	let series_data_histogram: any[] = [];

	let startDate = ''; // These will be string values in "YYYY-MM-DD" format.
	let endDate = '';

	let selectedBucket = null;

	function applyZoom() {
		if (startDate && endDate && myChartRef) {
			const startTimestamp = new Date(startDate).getTime();
			const endTimestamp = new Date(endDate).getTime();

			if (startTimestamp < endTimestamp) {
				// Zoom the chart to the user specified dates
				myChartRef.zoomX(startTimestamp, endTimestamp);

				// Get all months in between the start and end dates as [YYYY-MM]
				const months = Array.from(
					{ length: 12 },
					(_, i) =>
						`${new Date(startTimestamp).getFullYear()}-${(i + 1).toString().padStart(2, '0')}`
				);

				// Update the options to set the xaxis min and max, also change x-axis categories
				options = {
					...options,
					xaxis: {
						...options.xaxis,
						categories: months,
						min: startTimestamp,
						max: endTimestamp
					}
				};
			} else {
				console.error('Start date should be earlier than end date.');
			}
		}
	}

	// Define the chart options
	let options = {
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
			tickAmount: 6,
			min: 0
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

	let load_categories = [
		'0%',
		'0-9%',
		'10-19%',
		'20-29%',
		'30-39%',
		'40-49%',
		'50-59%',
		'60-69%',
		'70-79%',
		'80-89%',
		'90-99%',
		'100-109%',
		'110-119%',
		'120-129%',
		'130-139%',
		'140-149%',
		'150-174%',
		'175-199%',
		'200%+'
	];

	let selected_load_category = '0%';

	let options_histogram = {
		series: [
			{
				name: 'Peak Transformer Load',
				data: [],
				color: '#2C6EBF'
			}
		],
		chart: {
			type: 'bar',
			height: 350,
			animations: {
				enabled: false
			}
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '55%',
				endingShape: 'rounded'
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent']
		},
		xaxis: {
			categories: load_categories
		},
		fill: {
			opacity: 1
		},
		tooltip: {
			y: {
				formatter: function (val: number) {
					return val + ' Measures';
				}
			}
		}
	};

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	$: if ($histogram.data && $histogram.data.buckets) {
		options_histogram = {
			...options_histogram,
			chart: {
				...options_histogram.chart,
				events: {
					dataPointSelection(event, chartContext, config) {
						console.log(event);
						console.log(chartContext);
						console.log(config);
						if (config.seriesIndex === 0) {
							selectedBucket = $histogram.data.buckets[config.dataPointIndex];
							selected_load_category = load_categories[config.dataPointIndex];
						} else {
							selectedBucket = $histogram.data.bucketsEV[config.dataPointIndex];
							selected_load_category = load_categories[config.dataPointIndex];
						}
						//console.log(config.config.series[config.seriesIndex].data[config.dataPointIndex]);
					}
				}
			}
		};

		series_data_histogram = [
			{
				name: 'Peak Transformer Load',
				data: $histogram.data.buckets.map((item) => item.value),
				color: '#2C6EBF'
			},
			{
				name: 'Peak Transformer Load EV',
				data: $histogram.data.bucketsEV.map((item) => item.value),
				color: '#FFC000'
			}
		];
	}

	// Reactive statement to handle data update
	$: if ($dataStore.data && $dataStore.data.measures && $dataStore.data.driver_measures) {
		// Extracting the measures data
		let measures = $dataStore.data.measures;
		let ev_measures = $dataStore.data.driver_measures;

		if (measures.length < 1) {
			measures = [[0, 0]];
		}
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

		// End of year timestamp
		const endOfYearTimestamp = new Date(firstDate.getFullYear(), 11, 31).getTime();

		// Get months in between start of the year and end of the year in this format ([2019-10])
		const months = Array.from(
			{ length: 12 },
			(_, i) => `${firstDate.getFullYear()}-${(i + 1).toString().padStart(2, '0')}`
		);

		// Validate if measures array has data
		if (measures.length > 0) {
			// If the chart is already rendered, update the series with the complete data
			if (myChartRef) {
				console.log('hi');
				// myChartRef.zoomX(startOfYearTimestamp, measures[measures.length - 1][0]);
			}

			// Set zoom controls
			//startDate = new Date(startOfYearTimestamp).toISOString().split('T')[0];
			// endDate = new Date(measures[measures.length - 1][0]).toISOString().split('T')[0];

			if (ev_measures.length > 0) {
				series_data = [
					{
						data: ev_measures,
						name: 'EV Usage',
						color: '#FFC000',
						fill: {
							opacity: 1
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
				];
			} else {
				series_data = [
					{
						data: measures,
						name: 'Normal Usage',
						color: '#2C6EBF',
						fill: {
							opacity: 1
						}
					}
				];
			}

			// Update the chart options
			options = {
				...options,
				series: series_data,
				chart: {
					...options.chart,
					events: {
						beforeResetZoom: (ctx, opt) => {
							return {
								xaxis: {
									min: startOfYearTimestamp,
									// End of year timestamp
									max: endOfYearTimestamp
								}
							};
						}
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
				xaxis: {
					...options.xaxis,
					min: startOfYearTimestamp,
					categories: months
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
			};
		}
	}

	async function exportToXLSXHistogram(filename) {
		// Create a new workbook
		const workbook = new Excel.Workbook();
		const normalUsageWorksheet = workbook.addWorksheet('Normal Usage');

		// Define columns with headers and formatting if needed
		normalUsageWorksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'KVA_MEASURE', key: 'measure', width: 15 },
			{ header: 'LOAD_PERCENT', key: 'load_percentage', width: 15 },
			{ header: 'BUCKET', key: 'bucket', width: 15 },
			{
				header: 'PEAK_MEASURE_TIME',
				key: 'time',
				width: 22,
				style: { numFmt: 'mm/dd/yyyy hh:mm:ss AM/PM' }
			}
		];

		// Function to map transformer data to the desired format
		const mapTransformers = (transformers, bucketIndex) => {
			return transformers.map((transformer) => ({
				id: transformer.id.toString(),
				measure: transformer.measure,
				load_percentage: transformer.load_percentage,
				bucket: load_categories[bucketIndex],
				time: new Date(transformer.time) // Convert to Date object
			}));
		};

		// Process data for Normal Usage
		$histogram.data.buckets.forEach((bucket, index) => {
			const transformedData = mapTransformers(bucket.transformers, index);
			transformedData.forEach((data) => {
				normalUsageWorksheet.addRow(data);
			});
		});

		// Process and append data for EV Usage (if exists)
		if ($histogram.data.bucketsEV && $histogram.data.bucketsEV.length > 0) {
			const evUsageWorksheet = workbook.addWorksheet(`${$histogram.data.evload} EVs Usage`);
			evUsageWorksheet.columns = [...normalUsageWorksheet.columns]; // Copy columns from the normal usage sheet

			$histogram.data.bucketsEV.forEach((bucketEV, index) => {
				const transformedEVData = mapTransformers(bucketEV.transformers, index);
				transformedEVData.forEach((data) => {
					evUsageWorksheet.addRow(data);
				});
			});
		}

		// Write the workbook to a file
		// await workbook.xlsx.writeFile(filename + '.xlsx');
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `Load_Utilization_Report-PeakMeasures-${$histogram.data.month}_${$histogram.data.year}-EVs_${$histogram.data.evload}-NormalUsage.xlsx`;
			a.click();
		});
	}

	function exportToXLSXRiskReport() {
		// Create a new workbook
		const workbook = new Excel.Workbook();

		// Normal Usage
		const normalUsageWorksheet = workbook.addWorksheet('Normal Usage');

		// Define columns with headers and formatting if needed
		normalUsageWorksheet.columns = [
			{ header: 'XFMR_SID', key: 'id', width: 15 },
			{ header: 'KVA_MEASURE', key: 'measure', width: 15 },
			{ header: 'LOAD_PERCENT', key: 'load_percentage', width: 15 },
			{
				header: 'MEASURE_DATE',
				key: 'time',
				width: 22,
			},
			{
				header: 'UTC_TIME',
				key: 'interval',
				width: 22,
				style: { numFmt: 'mm/dd/yyyy hh:mm:ss AM/PM' }
			}
		];

		const mapMeasures = (measures) => {
			return measures.map((measure) => {
				const time = new Date(measure[0]); // Convert to Date object
				const utcTime = new Date(time.getTime() + 15 * 60000); // Add 15 minutes

				return {
					id: $dataStore.data.xfmr_sid,
					measure: measure[1].toFixed(3),
					load_percentage: (measure[1] / $dataStore.data.max).toFixed(3) * 100,
					time: time,
					interval: utcTime // New property with time 15 minutes later
				};
			});
		};

		const normalMeasures = mapMeasures($dataStore.data.measures);

		// Normal usage
		normalMeasures.forEach((measure) => {
			normalUsageWorksheet.addRow({
				id: measure.id,
				measure: measure.measure,
				load_percentage: measure.load_percentage,
				time: new Date(measure.time), // Convert to Date object
				interval: new Date(measure.interval) // Convert to Date object
			});
		});

		// EV Usage
		// Process and append data for EV Usage (if exists)
		if ($dataStore.data.driver_measures && $dataStore.data.driver_measures.length > 0) {
			const evUsageWorksheet = workbook.addWorksheet(`${$dataStore.data.evs} EVs Usage`);
			evUsageWorksheet.columns = [...normalUsageWorksheet.columns]; // Copy columns from the normal usage sheet

			const evMeasures = mapMeasures($dataStore.data.driver_measures);

			evMeasures.forEach((measure) => {
				evUsageWorksheet.addRow({
					id: measure.id,

					measure: measure.measure,
					load_percentage: measure.load_percentage,
					time: new Date(measure.time), // Convert to Date object
					interval: new Date(measure.interval) // Convert to Date object
				});
			});
		}


		// await workbook.xlsx.writeFile(filename + '.xlsx');
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `XFMR_Utilization_Report-${$dataStore.data.xfmr_sid}-${$dataStore.data.year}-EVs_${$dataStore.data.evs}-NormalUsage.xlsx`;
			a.click();
		});
	}
</script>

<div class="bg-epbthird h-14 relative">
	<div class="flex flex-row items-center h-full">
		<img
			class="ml-8 mr-8 cursor-pointer"
			src="/epb.svg"
			alt="EPB"
			height="80"
			width="80"
			on:click={() => {
				goto('/');
			}}
		/>
		<div class="flex items-center space-x-4 h-full text-white text-xs tracking-widest">
			<div class="flex flex-col justify-between h-full w-24 text-center">
				<a href="/search" class="font-semibold cursor-pointer mt-6">SEARCH</a>
				{#if data.pathname.includes('/search')}
					<div class="bg-epbgreen h-1 w-20 mx-auto" />
				{/if}
			</div>
			<div class="flex flex-col justify-between h-full w-32 text-center">
				<a href="/profiles" class="font-semibold cursor-pointer mt-6">DRIVER PROFILES</a>
				{#if data.pathname.includes('/profiles')}
					<div class="bg-epbgreen h-1 w-32 mx-auto" />
				{/if}
			</div>
			<div class="flex flex-col justify-between h-full w-32 text-center">
				<a href="/times" class="font-semibold cursor-pointer mt-6">TIME PROFILES</a>
				{#if data.pathname.includes('/times')}
					<div class="bg-epbgreen h-1 w-32 mx-auto" />
				{/if}
			</div>
			<div class="flex flex-col justify-between h-full w-32 text-center">
				<a href="/reports" class="font-semibold cursor-pointer mt-6">LOAD REPORTS</a>
				{#if data.pathname.includes('/reports')}
					<div class="bg-epbgreen h-1 w-28 mx-auto" />
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
		{#if $histogram.data.buckets && $histogram.data.buckets.length > 0}
			<div in:fade={{ duration: 300 }}>
				<form>
					<div class="flex flex-row">
						<h1 class="text-xl font-bold mb-6 ml-4 text-epb mt-6">PEAK LOAD DISTRIBUTION</h1>
						<Button
							class="bg-epb hover:bg-epbhover self-center ml-auto"
							on:click={() => exportToXLSXHistogram()}>Export to XLSX</Button
						>
					</div>
				</form>
				<h1 class="text-MD font-bold ml-4 mb-6 text-epbtext tracking-widest">
					ALL {$histogram.data.kva_rating}.0 KVA RATED TRANSFORMERS
				</h1>
				<div class="flex flex-row ml-4 mb-4">
					<p class="text-epbtext text-md tracking-widest uppercase">
						<span class="text-epb">MONTH</span> OF {$histogram.data.month}
						{$histogram.data.year}
					</p>
					<p class="text-epbtext ml-2 text-md tracking-widest">
						<span class="text-epb">HOURS</span> OF {$histogram.data.time_interval_string}
					</p>
				</div>
				<Chart
					options={options_histogram}
					series={series_data_histogram}
					bind:chartInstance={chartRef}
				/>
				<Tabs.Root value="normal">
					<Tabs.List>
						<Tabs.Trigger value="normal">Normal Usage</Tabs.Trigger>
						<Tabs.Trigger value="ev">EV Usage</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="normal">
						<div class="p-4 rounded">
							<p class="text-base font-semibold mb-2">Total Available kW</p>
							<p>
								{Number($histogram.data.total_available_kw).toLocaleString()}
								<span class="text-epb font-semibold">kW</span>
							</p>
						</div>
					</Tabs.Content>
					<Tabs.Content value="ev">
						<div class="p-4 rounded">
							<p class="text-base font-semibold mb-2">Total Available kW</p>
							<p>
								{Number($histogram.data.total_available_kw_ev).toLocaleString()}
								<span class="text-epb font-semibold">kW</span>
							</p>
						</div>
					</Tabs.Content>
				</Tabs.Root>
				{#if selectedBucket && selectedBucket.transformers && selectedBucket.transformers.length > 0}
					<div class="mt-6 ml-4">
						<h2 class="text-lg font-bold mb-4 text-epb">
							Transformers for {selected_load_category} load utilization
						</h2>
						<table class="min-w-full border-collapse">
							<thead>
								<tr>
									<th class="px-4 py-2 border border-gray-200 bg-gray-100">Transformer ID</th>
									<th class="px-4 py-2 border border-gray-200 bg-gray-100">KVA Measure</th>
									<!-- Add more headers if your transformer data has more fields -->
								</tr>
							</thead>
							<tbody>
								{#each selectedBucket.transformers as transformer}
									<tr>
										<td class="px-4 py-2 border border-gray-200">{transformer.id}</td>
										<td class="px-4 py-2 border border-gray-200"
											>{transformer.measure}</td
										>
										<!-- Add more cells if your transformer data has more fields -->
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
		<!-- Check if dataStore.data is available -->
		{#if $dataStore.data && $dataStore.data.measures.length > 0 && $dataStore.data.driver_measures.length > 0}
			<div in:fade={{ duration: 300 }}>
				<!-- Display the transformer SID -->
				<div class="flex flex-row mb-6 mt-6">
					<h1 class="text-xl font-bold ml-4 text-epb self-center">
						{$dataStore.data.year} TRANSFORMER REPORT
					</h1>
					<h1 class="text-black font-medium ml-4 self-center">SID: {$dataStore.data.xfmr_sid}</h1>
					<Button
						class="bg-epb hover:bg-epbhover self-center ml-auto"
						on:click={() => exportToXLSXRiskReport('exported-load-report')}>Export to XLSX</Button
					>
				</div>
				<h1 class="text-md font-semibold ml-4 mb-6 text-epbtext tracking-widest">
					{$dataStore.data.max}.0 KVA RATED TRANSFORMER
				</h1>

				<Chart {options} series={series_data} bind:chartInstance={myChartRef} />
				<Tabs.Root value="normal">
					<Tabs.List>
						<Tabs.Trigger value="normal">Normal Usage</Tabs.Trigger>
						<Tabs.Trigger value="ev">EV Usage</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="normal">
						<div class="grid grid-cols-1 gap-6">
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Total kWh Above Threshold</p>
								<p class="text-xl">
									{Number($dataStore.data.normal.total_kwh_above_threshold).toLocaleString()}
									<span class="text-epb font-semibold">kWh</span>
								</p>
							</div>
							<div class="px-4 py-2 rounded">
								<p class="text-base font-semibold mb-2">Total Overloaded Hours</p>
								<p class="text-xl">
									{Number($dataStore.data.normal.total_overloaded_hours).toLocaleString()}
									<span class="text-epb font-semibold">hours</span>
								</p>
							</div>
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Total Overloaded kWh</p>
								<p class="text-xl">
									{Number($dataStore.data.normal.total_overloaded_kwh).toLocaleString()}
									<span class="text-epb font-semibold">kWh</span>
								</p>
							</div>
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Upgrade Threshold</p>
								<p class="text-xl">
									{Number($dataStore.data.normal.upgrade_threshold).toLocaleString()}
								</p>
							</div>
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Total Available kWh</p>
								<p class="text-xl">
									{Number($dataStore.data.normal.total_available_kwh).toLocaleString()}
									<span class="text-epb font-semibold">kWh</span>
								</p>
							</div>
						</div>
					</Tabs.Content>
					<Tabs.Content value="ev">
						<div class="grid grid-cols-1 gap-6">
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Total kWh Above Threshold</p>
								<p class="text-xl">
									{Number($dataStore.data.ev_usage.total_kwh_above_threshold).toLocaleString()}
									<span class="text-epb font-semibold">kWh</span>
								</p>
							</div>
							<div class="px-4 py-2 rounded">
								<p class="text-base font-semibold mb-2">Total Overloaded Hours</p>
								<p class="text-xl">
									{Number($dataStore.data.ev_usage.total_overloaded_hours).toLocaleString()}
									<span class="text-epb font-semibold">hours</span>
								</p>
							</div>
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Total Overloaded kWh</p>
								<p class="text-xl">
									{Number($dataStore.data.ev_usage.total_overloaded_kwh).toLocaleString()}
									<span class="text-epb font-semibold">kWh</span>
								</p>
							</div>
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Upgrade Threshold</p>
								<p class="text-xl">
									{Number($dataStore.data.ev_usage.upgrade_threshold).toLocaleString()}
								</p>
							</div>
							<div class="p-4 rounded">
								<p class="text-base font-semibold mb-2">Total Available kWh</p>
								<p class="text-xl">
									{Number($dataStore.data.ev_usage.total_available_kwh).toLocaleString()}
									<span class="text-epb font-semibold">kWh</span>
								</p>
							</div>
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>
		{/if}
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
