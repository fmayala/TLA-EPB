<script lang="ts">
	// export let data;
	import { page } from '$app/stores';
	import TableProfiles from '../../../tables/driver/table-profiles.svelte';
	import DialogProfileCreate from '../../../dialogs/driver/dialog-profile-create.svelte';

	export let data: any;

	type Profile = {
		id: string;
		name: string;
		milesDriven: number;
		expenditure: number;
		interval: number;
		__checkbox?: any; // <-- Add this line
	};

	let tableData: Profile[] = data.profiles.map((profile: any) => {
		return {
			id: profile.ID,
			name: profile.NAME,
			milesDriven: profile.MILES_DRIVEN,
			expenditure: profile.KWH_EXPENDITURE,
			interval: profile.TIME_INTERVAL
		};
	});

	$: tableData = data.profiles.map((profile: any) => {
		return {
			id: profile.ID,
			name: profile.NAME,
			milesDriven: profile.MILES_DRIVEN,
			expenditure: profile.KWH_EXPENDITURE,
			interval: profile.TIME_INTERVAL
		};
	});

	const index = Number($page.params.page);

	// Calculate navigation possibilities
	let hasNextPage = (index) * 5 < data.profileCount + 1;
	let hasPreviousPage = index > 1;

	// When currentPageIndex changes, re-calculate navigation possibilities
	$: hasNextPage = (index) * 5 < data.profileCount + 1;
	$: hasPreviousPage = index > 1;
</script>

<head>
	<title>Profiles</title>
</head>

<div class="pt-6">
	<div class="flex flex-row mb-12">
		<h1 class="ml-1 self-center text-xl font-semibold mr-auto">Driver Profiles</h1>
		<DialogProfileCreate />
	</div>
	<TableProfiles
		data={tableData}
		hasNextPage={hasNextPage}
		hasPreviousPage={hasPreviousPage}
	/>
</div>

<!-- form={data.form} -->
