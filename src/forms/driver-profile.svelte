<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { formSchemaAddProfile, type FormSchemaAddProfile} from './schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	export let form: SuperValidated<FormSchemaAddProfile>;
</script>

<Form.Root method="POST" {form} action="?/profiles" schema={formSchemaAddProfile} let:config class="mt-5">
	<Form.Field {config} name="name">
		<Form.Item class="w-full">
			<Form.FormLabel class="text-sm">Profile Name</Form.FormLabel>
			<Form.Input placeholder="ex: Profile"/>
			<Form.Description>This is the profile name.</Form.Description>
			<Form.Validation />
		</Form.Item>
	</Form.Field>
	<Form.Field {config} name="milesdriven">
		<Form.Item class="w-full">
			<Form.FormLabel class="text-sm">Miles Driven Total Daily</Form.FormLabel>
			<Form.Input placeholder="ex: 579" type="number" min={0} value={0}/>
			<Form.Description>This is the total amount of miles driven daily.</Form.Description>
			<Form.Validation />
		</Form.Item>
	</Form.Field>
	<Form.Field {config} name="expenditure">
		<Form.Item class="w-full">
			<Form.FormLabel class="text-sm">EV kWh Expenditure</Form.FormLabel>
			<Form.Input type="number" step="0.01" placeholder="ex: 0.4kWh" min={0} value={0}/>
			<Form.Description>EV kWh Expenditure is the amount of electricity used by the vehicle per mile.</Form.Description>
			<Form.Validation />
		</Form.Item>
	</Form.Field>
    <Form.Button class="w-full mt-6 bg-epb hover:bg-epbhover">Add</Form.Button>
</Form.Root>
