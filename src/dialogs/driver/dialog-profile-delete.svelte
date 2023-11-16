<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Dialog as T } from 'bits-ui';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';

	let isOpen = false; // Or any other default state

	export let id: string;

	function openModal() {
		isOpen = true;
	}

	function closeModal() {
		isOpen = false;
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Button on:click={openModal} class="bg-transparent text-red-500 hover:bg-gray-100">
		<span class="self-center">Delete</span>
	</Button>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure you want to delete this profile?</Dialog.Title>
			<Dialog.Description>This action cannot be undone.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-row space-x-4">
			<T.Close class="py-2 rounded-sm bg-gray-200 px-4 w-full">Cancel</T.Close>
			<form action="?/deleteProfile" method="POST" class="w-full" use:enhance={()=>{
                return async ({result, update}) => {
                    if (result.type === 'success') {
                        isOpen = false;
                    }
                    await update();
                }
            }}>
                <input value={id} class="hidden" name="id">
				<Button
					class="py-2 rounded-sm px-4 w-full text-white bg-red-500 hover:bg-red-700"
                    on:click={()=>{
                        
                    }}
					>Delete</Button
				>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>