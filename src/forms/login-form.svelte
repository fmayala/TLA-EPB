<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { formSchema, type FormSchema } from './schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	export let form: SuperValidated<FormSchema>;
</script>

<Form.Root method="POST" {form}  schema={formSchema} let:config>
	<Form.Field {config} name="username">
		<Form.Item>
			<Form.Label class="text-base">Username</Form.Label>
			<Form.Input />
			<!-- <Form.Description>This is your public display name.</Form.Description> -->
			<Form.Validation />
		</Form.Item>
	</Form.Field>
	<div class="my-5"></div>
	<Form.Field {config} name="password">
		<Form.Item>
			<Form.Label class="text-base">Password</Form.Label>
			<Form.Input />
			<!-- <Form.Description>This is your public display name.</Form.Description> -->
			<Form.Validation />
		</Form.Item>
	</Form.Field>
	<Form.Button class="w-full mt-10 bg-epb hover:bg-epbhover">Login</Form.Button>
</Form.Root>
