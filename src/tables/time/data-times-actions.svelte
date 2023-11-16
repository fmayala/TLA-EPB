<script lang="ts">
	import TimeEdit from '../../dialogs/time/dialog-time-edit.svelte';
	import TimeDelete from '../../dialogs/time/dialog-time-delete.svelte';

	export let id: string;
	export let name: string;
	export let start: string;
	export let end: string;
</script>

<TimeEdit {id} {name} {start} {end}/>
<TimeDelete {id}/>