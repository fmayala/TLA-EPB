<script lang="ts">
	import Actions from './data-table-actions.svelte';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import pageIndex from '$lib/stores/pagination';
	import { goto } from '$app/navigation';

	export let data: any[] = [];
	export let hasPreviousPage: boolean = false;
	export let hasNextPage: boolean = false;

	let filteredData = [...data];
	let sortedData = [...filteredData];
	let currentPage = 1;
	const itemsPerPage = 10;

	let filterValue = '';
	let sortBy = '';

	function handleProfileDeleted(event: CustomEvent) {
		const deletedId = event.detail;
		data = data.filter((item) => item.id !== deletedId);
		filterAndSortData();
	}

	function filterAndSortData() {
		filteredData = data.filter((item) => item.name.includes(filterValue));

		if (sortBy) {
			sortedData = filteredData.sort((a, b) => a[sortBy] - b[sortBy]);
		} else {
			sortedData = [...filteredData];
		}
	}

	$: if (data) filterAndSortData();
	$: pagedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
</script>

<!-- Table UI -->
<div class="w-full overflow-auto mt-6">
	<div class="mb-6 p-4 border rounded bg-gray-100">
		<h2 class="text-xl font-bold mb-3">Legend</h2>

		<ul class="list-disc pl-5">
			<li><span class="font-semibold">ID:</span> A unique identifier for each profile.</li>
			<li>
				<span class="font-semibold">Name:</span> The name of the individual or entity associated with
				the profile.
			</li>
			<li>
				<span class="font-semibold">Miles Driven:</span> The total number of miles driven by the individual
				or entity.
			</li>
			<li>
				<span class="font-semibold">Expenditure:</span> The total expenditure of the EV expressed in
				kWh per mile.
			</li>
			<li>
				<span class="font-semibold">Interval:</span> The time interval of the profile. This is an
				<span class="font-semibold">identifier</span> which can be used to cross-reference the corresponding
				record in the time profiles page. 
			</li>
		</ul>
	</div>

	<Input
		bind:value={filterValue}
		class="max-w-sm mb-6"
		placeholder="Filter profiles"
		type="text"
		on:input={filterAndSortData}
	/>

	<table class="w-full caption-bottom text-sm">
		<thead class={cn('[&_tr]:border-b', '')}>
			<tr
				class={cn(
					'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
					''
				)}
			>
				<th
					class={cn(
						'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
						''
					)}>ID</th
				>
				<th
					class={cn(
						'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
						''
					)}>Name</th
				>
				<th
					class={cn(
						'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
						''
					)}>Miles Driven</th
				>
				<th
					class={cn(
						'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
						''
					)}>Expenditure</th
				>
				<th
					class={cn(
						'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
						''
					)}>Interval</th
				>
				<th
					class={cn(
						'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
						''
					)}
				/>
			</tr>
		</thead>
		<tbody class={cn('[&_tr:last-child]:border-0', '')}>
			{#each pagedData as row (row.id)}
				<tr
					class={cn(
						'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
						''
					)}
				>
					<td class="td-style">{row.id}</td>
					<td class="td-style">{row.name}</td>
					<td class="td-style">{row.milesDriven}</td>
					<td class="td-style">{row.expenditure}</td>
					<td class="td-style">{row.interval}</td>
					<td class="td-style">
						<Actions
							id={row.id}
							name={row.name}
							milesdriven={row.milesDriven}
							expenditure={row.expenditure}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			<!-- {Object.keys($selectedDataIds).length} of{' '}
			{$rows.length} row(s) selected. -->
		</div>
		<Button
			variant="outline"
			size="sm"
			on:click={() => {
				$pageIndex--;
				goto(`/profiles/${$pageIndex}`);
			}}
			disabled={!hasPreviousPage}>Previous</Button
		>

		<Button
			variant="outline"
			size="sm"
			disabled={!hasNextPage}
			on:click={() => {
				$pageIndex++;
				goto(`/profiles/${$pageIndex}`);
			}}>Next</Button
		>
	</div>
</div>

<style>
	.th-style {
		@apply h-12 px-4 text-left align-middle font-medium text-muted-foreground;
	}

	.td-style {
		@apply p-2 align-middle;
	}

	.truncate {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
