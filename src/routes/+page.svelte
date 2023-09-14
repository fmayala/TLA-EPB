<script lang="ts">
	import logo from '$lib/assets/epb-2.svg';
	import type { Page } from '@sveltejs/kit';
	import LoginForm from '../forms/login-form.svelte';
	export let data: Page;
</script>

<div class="flex flex-col">
	<div class="flex flex-row mx-auto mt-20">
		<div>
			<img src={logo} alt="EPB logo" />
		</div>
		<div class="self-center ml-4">
			<h1 class="text-lg">Transformer Loading Analysis</h1>
		</div>
	</div>
    <div class="w-96 mx-auto mt-20">
        <LoginForm form={data.form} />
    </div>
</div>
