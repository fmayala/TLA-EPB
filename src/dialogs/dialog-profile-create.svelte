<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { enhance } from '$app/forms';
	import { writable, type Writable } from 'svelte/store';

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
			<span class="self-center">Add Profile</span>
		</div>
	</Button>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add a driver profile</Dialog.Title>
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
					>Profile Name</label
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
					for="milesdriven"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Miles Driven Total Daily</label
				>
				<input
					class={'flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50'}
					placeholder="ex: 579"
					type="number"
					min={5}
					max={75}
					step={5}
					value={5}
					name="milesdriven"
					on:input={(e) => {
						// only remove the error if the field is not empty
						if (e.target.value >= 5 && e.target.value <= 75) {
							formErrors.update((errors) => {
								delete errors.milesdriven;
								return errors;
							});
						} else {
							formErrors.update((errors) => {
								errors.milesdriven = 'Miles driven must be between 5 and 75';
								return errors;
							});
						} 
					}}
				/>
				<p class="text-sm text-muted-foreground mt-2">This is the total amount of miles driven daily.</p>
				{#if $formErrors.milesdriven}
					<p class="text-sm text-muted-foreground text-red-500">{$formErrors.milesdriven}</p>
				{/if}
			</div>
			<div class="mb-4">
				<label
					for="expenditure"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>EV kWh Expenditure</label
				>
				<input
					class={'flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50'}
					type="number"
					step="0.01"
					placeholder="ex: 0.4kWh"
					min={0}
					value={0.35}
					name="expenditure"
					on:input={(e) => {
						// only remove the error if the field is not empty
						if (e.target.value >= 0) {
							formErrors.update((errors) => {
								delete errors.expenditure;
								return errors;
							});
						} else {
							formErrors.update((errors) => {
								errors.expenditure = 'Expenditure cannot be negative';
								return errors;
							});
						} 
					}}
				/>
				<p class="text-sm text-muted-foreground mt-2">
					EV kWh Expenditure is the amount of kilowatt-hours used by the vehicle per mile. See <a target="_blank" href="https://ecocostsavings.com/electric-car-kwh-per-mile-list/">here</a> for common values.
				</p>
				{#if $formErrors.expenditure}
					<p class="text-sm text-muted-foreground text-red-500">{$formErrors.expenditure}</p>
				{/if}
			</div>
			<div class="mb-4">
				<label
					for="interval"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Time Interval</label
				>
				<input
					class={'flex h-10 w-full rounded-md border border-input border-inputborder bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-epb disabled:cursor-not-allowed disabled:opacity-50'}
					type="number"
					step="1"
					placeholder="ex: 1 -> 6AM-12PM"
					value={0}
					min={0}
					max={3}
					name="interval"
					on:input={(e) => {
						// only remove the error if the field is not empty
						if (e.target.value >= 0) {
							formErrors.update((errors) => {
								delete errors.interval;
								return errors;
							});
						} else {
							formErrors.update((errors) => {
								errors.interval = 'Interval is not valid.';
								return errors;
							});
						} 
					}}
				/>
				<p class="text-sm text-muted-foreground mt-2">
					This is the associated time interval for the profile. See the legend on the profiles page for more information.
				</p>
				{#if $formErrors.interval}
					<p class="text-sm text-muted-foreground text-red-500">{$formErrors.interval}</p>
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
