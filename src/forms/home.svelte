<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { goto } from '$app/navigation';  // Import goto for navigation
	import { formSchema, type FormSchema } from './schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	export let form: SuperValidated<FormSchema>;
</script>

<Form.Root method="POST" {form} schema={formSchema} let:config>
	<!-- Got rid of username and login -->

	<!-- buttons. resembles base GUI/desktop app -->
	<button class="w-full mt-5 bg-epb hover:bg-epbhover" on:click={() => goto('/histogram')}>
		Histogram Report
	</button>

	<button class="w-full mt-5 bg-epb hover:bg-epbhover" on:click={() => goto('/risk')}>
		Risk Report
	</button>
</Form.Root>
