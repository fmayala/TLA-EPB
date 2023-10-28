<script>
	import { onMount } from 'svelte';

	export let options;
	export let series; // New prop

	let ApexCharts;
	let loaded = false;
	let myChart; // to hold the chart instance for external reference

	const chart = (node, { series, ...restOptions }) => {

		if (!loaded) return;

		myChart = new ApexCharts(node, { series, ...restOptions });
		myChart.render();

		return {
			update({ series, ...updatedOptions }) {
				if (series) {
					myChart.updateSeries(series, true); // Update the series data
				}
				myChart.updateOptions(updatedOptions); // Update other options
			},
			destroy() {
				myChart.destroy();
			}
		};
	};

	onMount(async () => {
		const module = await import('apexcharts');
		ApexCharts = module.default;
		window.ApexCharts = ApexCharts;
		loaded = true;
	});

    // This is how you expose the chart instance for external reference
	export { myChart as chartInstance };
</script>

{#if loaded}
	<div use:chart={{ ...options, series }}></div>
{/if}
