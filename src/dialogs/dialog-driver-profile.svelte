<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import DriverProfile from '../forms/driver-profile.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { FormSchemaAddProfile } from '../forms/schema';
	import { Dialog as T } from 'bits-ui';

	export let form: SuperValidated<FormSchemaAddProfile>;
</script>

<Dialog.Root>
	<Dialog.Trigger class="bg-epb px-3 py-2 rounded-sm">
		<div class="flex flex-row">
			<Icon icon="mdi-light:plus" class="self-center text-white" />
			<span class="text-white">Add profile</span>
		</div>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add a driver profile</Dialog.Title>
		</Dialog.Header>
		<DriverProfile {form}/>
		<T.Close class="py-2 rounded-sm">Cancel</T.Close>
	</Dialog.Content>
</Dialog.Root>
