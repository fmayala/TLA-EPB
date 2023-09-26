<script lang="ts">
	import Delete from '../dialogs/dialog-profile-delete.svelte';
	import Edit from '../dialogs/dialog-profile-edit.svelte';

	// ...other imports
	export let id: string;
	export let name: string;
	export let milesdriven: number;
	export let expenditure: number;
</script>

<!-- Modal Code -->
<Edit {id} {name} {milesdriven} {expenditure} />
<Delete {id} />
