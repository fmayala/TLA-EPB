<script lang="ts">
    import { onMount } from "svelte";
    let data = [];

    onMount(async () => {
        const response = await fetch("/backend/queryData");
        data = await response.json();
    });

    const downloadCSV = () => {
        // insert logic
    };
</script>

<button on:click={downloadCSV}>Download CSV</button>

