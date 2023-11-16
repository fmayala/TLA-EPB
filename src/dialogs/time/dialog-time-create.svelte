<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { enhance } from '$app/forms';
	import { writable, type Writable } from 'svelte/store';
	import AsyncSelectTime from '$lib/components/AsyncSelectTime.svelte';

	type FormErrors = {
		[key: string]: string;
	};

	const formErrors: Writable<FormErrors> = writable({});

	// export let form: SuperValidated<FormSchemaAddProfile>;
	let isOpen = false; // Or any other default state

	function openModal() {
		isOpen = true;
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Button on:click={openModal} class="bg-epb hover:bg-epbhover">
		<div class="flex flex-row">
			<Icon icon="mdi-light:plus" class="w-6 h-6" />
			<span class="self-center">Add Time Profile</span>
		</div>
	</Button>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add a time profile</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action="?/addProfile"
			use:enhance={() => {
				return async ({ update, result }) => {
					// @ts-ignore
					let data = result.data;

					if (result.status === 400) {
						let d = data.data;
						formErrors.set(
							d.errors.reduce((acc, curr) => {
								acc[curr.field] = curr.message;
								return acc;
							}, {})
						);
					}

					if (result.status === 200) {
						isOpen = false;
					}

					await update();
					// isOpen = false;
				};
			}}
		>
			<div class="mb-4">
				<label
					for="name"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Interval Name</label
				>
				<input
					class={'flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50'}
					placeholder="ex: Profile"
					name="name"
					on:input={(e) => {
						// only remove the error if the field is not empty
						if (e.target.value.length >= 2 && e.target.value.length <= 50) {
							formErrors.update((errors) => {
								delete errors.name;
								return errors;
							});
						} else {
							formErrors.update((errors) => {
								errors.name = 'Name must be between 2 and 50 characters';
								return errors;
							});
						}
					}}
				/>
				<p class="text-sm text-muted-foreground mt-2">This is the profile name.</p>
				{#if $formErrors.name}
					<p class="text-sm text-muted-foreground text-red-500">{$formErrors.name}</p>
				{/if}
			</div>
			<div class="mb-4">
				<label
                    for="start"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
					>Start Time</label
				>
				<input
					name="start"
					type="time"
					class="mt-4 mb-4 flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					required
				/>
				<p class="text-sm text-muted-foreground mt-2">
					This is the start time of the interval. Ex: 2:00:00 PM.
				</p>
				{#if $formErrors.start}
					<p class="text-sm text-muted-foreground text-red-500">{$formErrors.start}</p>
				{/if}
			</div>
			<div class="mb-4">
				<label
                    for="end"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-4"
					>Start Time</label
				>
				<input
					name="end"
					type="time"
					class="mt-4 mb-4 flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50"
					required
				/>
				<p class="text-sm text-muted-foreground mt-2">
					This is the end time of the interval. Ex: 4:00:00 PM.
				</p>
				{#if $formErrors.end}
					<p class="text-sm text-muted-foreground text-red-500">{$formErrors.end}</p>
				{/if}
			</div>

			<div class="flex flex-row mt-6 space-x-4">
				<Button
					class="py-2 rounded-sm bg-gray-200 px-4 w-full text-black hover:bg-gray-300"
					on:click={(e) => {
						e.preventDefault();
						isOpen = false;
					}}>Cancel</Button
				>
				<Button class="w-full bg-epb hover:bg-epbhover">Add</Button>
			</div>
		</form>
		<!-- </Form> -->
	</Dialog.Content>
</Dialog.Root>
