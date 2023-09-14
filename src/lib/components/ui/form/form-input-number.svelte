<script lang="ts">
	import { getFormField } from "formsnap";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { Input, type InputEvents } from "$lib/components/ui/input";

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

    let max: number;
    let min: number;

	const { attrStore, value } = getFormField();
</script>

<Input
	{...$attrStore}
	bind:value={$value}
	type="number"
    max={max}
    min={min}
	{...$$restProps}
	on:blur
	on:change
	on:click
	on:focus
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
/>
