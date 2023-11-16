<script lang="ts">
	// export let data;
	import pageIndex from '$lib/stores/pagination';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import TableTimes from '../../../tables/time/table-times.svelte';
	import DialogTimeCreate from '../../../dialogs/time/dialog-time-create.svelte';
	import { toUTCTimeString } from '$lib/utils.ts';

	export let data: any;

	type Interval = {
		id: number;
		name: string;
		start: string; // "HH:mm:ss" format
		end: string; // "HH:mm:ss" format
		__checkbox?: any; // <-- Add this line
	};

	let tableData: Interval[] = data.profiles.map((profile: any) => {
		return {
			id: profile.ID,
			name: profile.Name,
			start: toUTCTimeString(profile.Start),
			end: toUTCTimeString(profile.End)
		};
	});

	$: tableData = data.profiles.map((profile: any) => {
		return {
			id: profile.ID,
			name: profile.Name,
			start: toUTCTimeString(profile.Start),
			end: toUTCTimeString(profile.End)
		};
	});

	$: console.log(tableData);
	$: console.log(data.profiles);

	const index = Number($page.params.page);

	// Calculate navigation possibilities
	let hasNextPage = index * 5 < data.profileCount + 1;
	let hasPreviousPage = index > 1;

	// When currentPageIndex changes, re-calculate navigation possibilities
	$: hasNextPage = index * 5 < data.profileCount + 1;
	$: hasPreviousPage = index > 1;
</script>

<head>
	<title>Time Profiles</title>
</head>

<div class="pt-6">
	<div class="flex flex-row mb-12">
		<h1 class="ml-1 self-center text-xl font-semibold mr-auto">Time Profiles</h1>
		<DialogTimeCreate />
	</div>
	<TableTimes data={tableData} {hasNextPage} {hasPreviousPage} />
</div>

<!-- form={data.form} -->
