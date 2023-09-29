<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';

	export let name = 'selectedProfile'; // For the input name attribute
	export let placeholder = 'Select a profile';
	export let options: { ID: number, NAME: string }[] = [];

	let isDropdownOpen = false;
	let selectedOption: { ID: number, NAME: string } | null = null;

	let dropdownContainer;

	function handleClickOutside(event) {
		if (dropdownContainer) {
			if (!dropdownContainer.contains(event.target) && isDropdownOpen) {
				toggleDropdown();
			}
		}
	}

	function toggleDropdown() {
        if (!document) return;

		isDropdownOpen = !isDropdownOpen;

		if (isDropdownOpen ) {
		    document?.addEventListener('click', handleClickOutside);
		} else {
			document?.removeEventListener('click', handleClickOutside);
		}
	}
</script>

<div class="relative w-full mt-4" bind:this={dropdownContainer}>
	<div class="border rounded-md px-3 py-2 cursor-pointer border-input border-inputborder" on:click={toggleDropdown}>
		<div class="flex flex-row">
			<p class="text-muted-foreground">{selectedOption ? selectedOption.NAME : placeholder}</p>
			<ChevronDown class="ml-auto" on:click={toggleDropdown} />
		</div>
	</div>
	{#if isDropdownOpen}
		<div class="absolute z-30 mt-2 w-full border rounded overflow-y-auto bg-white shadow-md" style="max-height: 200px;">
			{#each options as option (option.ID)}
				<div
					class="px-3 py-2 hover:bg-gray-200 cursor-pointer z-20"
					on:click={() => {
						selectedOption = option;
						toggleDropdown();
					}}
				>
					{option.NAME}
				</div>
			{/each}
		</div>
	{/if}
	<input type="hidden" value={selectedOption ? selectedOption.ID : null} {name} />
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
