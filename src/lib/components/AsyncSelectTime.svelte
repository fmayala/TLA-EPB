<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { derived, writable, type Writable } from 'svelte/store';

	export let name = 'interval'; // For the input name attribute
	export let placeholder = 'Select a profile';

	type Interval = {
		ID: number;
		Name: string;
		Start: string; // "HH:mm:ss" format
		End: string; // "HH:mm:ss" format
	};

	let profiles: Writable<Interval[]> = writable([]);
	let page = 1;
	const limit = 5;
	let isLoading = false;
	let isDropdownOpen = false;
	let selectedProfile: any = null;
	let totalCount = 0; // Total profiles count
	let searchQuery = writable('');

	const filtered = derived([profiles, searchQuery], ([$profiles, $searchQuery]) => {
		return $profiles.filter((profile) =>
			profile.Name.toLowerCase().includes($searchQuery.toLowerCase())
		);
	});

	let dropdownContainer;

	function handleClickOutside(event) {
		if (dropdownContainer) {
			if (!dropdownContainer.contains(event.target) && isDropdownOpen) {
				toggleDropdown();
			}
		}
	}

	async function fetchMoreProfiles() {
		if (isLoading) return;

		isLoading = true;
		const res = await fetch(`/times?page=${page}&limit=${limit}`);
		const data = await res.json();

		//console.log(data);
		//console.log(data.profiles);

		if (data && data.profiles.length > 0) {
			profiles.update((p) => [...p, ...data.profiles]);
			page++;
		}

		// Set the totalCount when you fetch data
		if (data && typeof data.count === 'number') {
			totalCount = data.count;
		}

		// if (data && data.length > 0) {
		//     $profiles = [...$profiles, ...data];
		//     page++;
		// }
		isLoading = false;
	}

	async function fetchAllProfiles() {
		let currentPage = 1;

		async function fetchPage() {
			const res = await fetch(`/times?page=${currentPage}&limit=${limit}`);
			const data = await res.json();

			if (data && data.profiles.length > 0) {
				profiles.update((p) => [...p, ...data.profiles]);
				currentPage++;
			}

			// Set the totalCount when you fetch data
			if (data && typeof data.count === 'number') {
				totalCount = data.count;
			}

			// If the fetched profiles are equal to the limit and the fetched profiles are less than totalCount
			// it means there might be more profiles to fetch.
			if (data.profiles.length === limit && $profiles.length < totalCount) {
				await fetchPage();
			}
		}

		await fetchPage();
	}

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;

		if (isDropdownOpen) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}

		if (isDropdownOpen && $profiles.length === 0) {
			fetchMoreProfiles();
		}
	}

	// onDestroy(() => {
	// 	document.removeEventListener('click', handleClickOutside);
	// });

	onMount(() => {
		fetchAllProfiles();
	});
</script>

<div class="relative w-full mt-4" bind:this={dropdownContainer}>
	<div
		class="border rounded-md px-3 py-2 cursor-pointer border-input border-inputborder"
		on:click={toggleDropdown}
	>
		<div class="flex flex-row">
			<p class="text-muted-foreground">{selectedProfile ? selectedProfile.Name : placeholder}</p>
			<ChevronDown class="ml-auto" on:click={toggleDropdown} />
		</div>
	</div>
	{#if isDropdownOpen}
		<div
			class="absolute z-30 mt-2 w-full border rounded overflow-y-auto bg-white shadow-md"
			style="max-height: 200px;"
			on:scroll={(e) => {
				const target = e.target;
				let loadMore = target.scrollHeight - target.scrollTop === target.clientHeight;
				let hasMoreProfiles = $profiles.length < totalCount && $profiles.length !== 0;
				if (loadMore && hasMoreProfiles) {
					fetchMoreProfiles();
				}
			}}
		>
			<input
				class="px-3 py-2 w-full focus-visible:outline-none focus-visible:border-epb"
				type="text"
				bind:value={$searchQuery}
				placeholder="Search..."
			/>
			{#each $filtered as profile (profile.ID)}
				<div
					class="px-3 py-2 hover:bg-gray-200 cursor-pointer z-20"
					on:click={() => {
						selectedProfile = profile;
						toggleDropdown();
						// console.log(profile);
					}}
				>
					{profile.Name}
				</div>
			{/each}
			{#if isLoading}
				<div class="px-3 py-2 text-center">Loading...</div>
			{/if}
		</div>
	{/if}
	<input type="hidden" value={selectedProfile ? selectedProfile.ID : null} {name} />
</div>

<style>
	/* Add custom styles if needed */

	.overflow-y-auto::-webkit-scrollbar {
		width: 10px; /* Adjust width for the scrollbar */
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: #888; /* Color of the scroll thumb */
		border-radius: 5px; /* Roundness of the scroll thumb */
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background-color: #555; /* Color of the scroll thumb on hover */
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background-color: #f1f1f1; /* Color of the track */
	}

	.overflow-y-auto::-webkit-scrollbar-button {
		display: none; /* This hides the up and down scroll buttons */
	}

	.overflow-y-auto {
		scrollbar-width: thin; /* "thin" or "auto" or "none" */
		scrollbar-color: #888 #f1f1f1; /* thumb and track color */
	}
</style>
