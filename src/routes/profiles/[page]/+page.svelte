<script lang="ts">
	// export let data;
	import pageIndex from '$lib/stores/pagination';
	import { onMount } from 'svelte';
	import DialogProfile from '../../../dialogs/dialog-profile-create.svelte';
	import TableProfiles from '../../../tables/table-profiles.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: any;

	type Profile = {
		id: string;
		name: string;
		milesDriven: number;
		expenditure: number;
		__checkbox?: any; // <-- Add this line
	};

	let tableData: Profile[] = data.profiles.map((profile: any) => {
		return {
			id: profile.ID,
			name: profile.NAME,
			milesDriven: profile.MILES_DRIVEN,
			expenditure: profile.KVA_EXPENDITURE
		};
	});

	$: tableData = data.profiles.map((profile: any) => {
		return {
			id: profile.ID,
			name: profile.NAME,
			milesDriven: profile.MILES_DRIVEN,
			expenditure: profile.KVA_EXPENDITURE
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

<div>
	<div class="flex flex-row mt-10">
		<h1 class="ml-1 self-center text-xl font-semibold mr-auto">Driver Profiles</h1>
		<DialogProfile />
	</div>
	<TableProfiles
		data={tableData}
		hasNextPage={hasNextPage}
		hasPreviousPage={hasPreviousPage}
	/>
</div>

<!-- form={data.form} -->
