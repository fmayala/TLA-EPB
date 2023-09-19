<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { formSchema, type FormSchema } from './schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	export let form: SuperValidated<FormSchema>;
</script>

<Form.Root method="POST" {form} action="?/generate" schema={formSchema} let:config class="mt-5">
	<Form.Field {config} name="profile">
		<Form.Item>
			<Form.Label class="text-sm">Driver Profile</Form.Label>
			<Form.Select>
				<Form.SelectTrigger placeholder="Select a driver profile" />
				<Form.SelectContent>
					<Form.SelectItem value="m@example.com">m@example.com</Form.SelectItem>
					<Form.SelectItem value="m@google.com">m@google.com</Form.SelectItem>
					<Form.SelectItem value="m@support.com">m@support.com</Form.SelectItem>
				</Form.SelectContent>
			</Form.Select>
			<!-- <Form.Description>This is your public display name.</Form.Description> -->
			<Form.Validation />
		</Form.Item>
	</Form.Field>
	<div class="my-5" />
    <div class="flex flex-row space-x-5">
        <Form.Field {config} name="ev">
            <Form.Item>
                <Form.Label class="text-sm">Number of EVs</Form.Label>
                <Form.InputNumber value={0} max={10} min={0} />
                <!-- <Form.Description>This is your public display name.</Form.Description> -->
                <Form.Validation />
            </Form.Item>
        </Form.Field>
        <Form.Field {config} name="threshold_percentage">
            <Form.Item class="ml-4">
                <Form.Label class="text-sm">Threshold Percentage</Form.Label>
                <Form.InputNumber value={0} max={10} min={0} />
                <!-- <Form.Description>This is your public display name.</Form.Description> -->
                <Form.Validation />
            </Form.Item>
        </Form.Field>
    </div>
	<Form.Button class="w-full mt-10 bg-epb hover:bg-epbhover">Generate</Form.Button>
</Form.Root>
