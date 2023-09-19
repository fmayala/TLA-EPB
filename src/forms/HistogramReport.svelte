<script lang="ts">
    import { onMount } from "svelte";
    import Plotly from 'plotly.js-dist';
    import { saveAs } from 'file-saver';
    import type { Data, Layout } from 'plotly.js-dist';

    type DataFrameRow = {
        XFMR_SID: number,
        KVA_MEASURE: number,
        LOAD_PERCENT: number,
        BUCKET: string
    };

    let df: DataFrameRow[] = [];
    let simulatedDF: DataFrameRow[] = [];
    let KVA_RATING: number = 0;
    let num_ev: number = 0;

    // Simulate the createDataFrame method
    function createDataFrame() {
        // Replace with your actual logic to fetch data from the database
        df = [
            { XFMR_SID: 1, KVA_MEASURE: 10, LOAD_PERCENT: 0, BUCKET: '' },
            { XFMR_SID: 2, KVA_MEASURE: 20, LOAD_PERCENT: 0, BUCKET: '' },
            // ... more rows
        ];
    }

    // Simulate EV usage
    function simulateEV() {
        simulatedDF = JSON.parse(JSON.stringify(df));  // Deep copy
        for (let i = 0; i < num_ev; i++) {
            const randomIndex = Math.floor(Math.random() * simulatedDF.length);
            simulatedDF[randomIndex].KVA_MEASURE += 7;
        }
    }

    // Convert KVA_MEASURE to percent based on KVA_RATING
    function changeToPercent() {
        df = df.map(row => ({
            ...row,
            LOAD_PERCENT: (row.KVA_MEASURE / KVA_RATING) * 100
        }));

        simulatedDF = simulatedDF.map(row => ({
            ...row,
            LOAD_PERCENT: (row.KVA_MEASURE / KVA_RATING) * 100
        }));
    }

    // Create buckets
    function createBuckets() {
        const bins = [-1, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 175, 200, Infinity];
        const labels = ['0%', '0-9%', '10-19%', '20-29%', '30-39%', '40-49%', '50-59%', '60-69%', '70-79%', '80-89%', '90-99%', '100-109%','110-119%','120-129%','130-139%','140-149%','150-174%','175-199%', '200%+'];

        df = df.map(row => {
            const bucket = bins.findIndex((bin, index) => {
                return row.LOAD_PERCENT > bin && row.LOAD_PERCENT <= bins[index + 1];
            });
            return { ...row, BUCKET: labels[bucket] };
        });

        simulatedDF = simulatedDF.map(row => {
            const bucket = bins.findIndex((bin, index) => {
                return row.LOAD_PERCENT > bin && row.LOAD_PERCENT <= bins[index + 1];
            });
            return { ...row, BUCKET: labels[bucket] };
        });
    }

    function plotDataFrame() {
        const xLabels = df.map(row => row.BUCKET);
        const yValues = df.map(row => row.LOAD_PERCENT);
        const yValuesSimulated = simulatedDF.map(row => row.LOAD_PERCENT);

        const trace1: Data = {
            x: xLabels,
            y: yValues,
            type: 'bar',
            name: 'Original Data'
        };

        const trace2: Data = {
            x: xLabels,
            y: yValuesSimulated,
            type: 'bar',
            name: 'Simulated Data'
        };

        const layout: Partial<Layout> = {
            title: 'Your Plot Title',
            xaxis: {
                title: 'Bucket'
            },
            yaxis: {
                title: 'Load Percent'
            }
        };

        Plotly.newPlot('plotlyDiv', [trace1, trace2], layout);
    }

    const downloadCSV = () => {
        const header = ["XFMR_SID", "KVA_MEASURE", "LOAD_PERCENT", "BUCKET"];
        const csvContent = [header, ...df.map(row => Object.values(row))].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'data.csv');
    };

    onMount(() => {
        createDataFrame();
        simulateEV();
        changeToPercent();
        createBuckets();
    });
</script>

<!-- HTML and Svelte code for the UI -->
<div id="plotlyDiv" style="width:600px;height:400px;"></div>
<button on:click={plotDataFrame}>Plot Data</button>
<button on:click={downloadCSV}>Download CSV</button>
