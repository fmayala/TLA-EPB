<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import { formSchema, type FormSchema } from './schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	export let form: SuperValidated<FormSchema>;
</script>

<Form.Root method="POST" {form} schema={formSchema} let:config class="mt-5">
	<Form.Field {config} name="username">
		<Form.Item>
			<Form.Label class="text-sm">Driver Profile</Form.Label>
			<Form.Select>
				<Form.SelectTrigger placeholder="Select a verified email to display" />
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
    <div class="flex flex-row">
        <Form.Field {config} name="password">
            <Form.Item>
                <Form.Label class="text-sm">Number of EVs</Form.Label>
                <Form.InputNumber value={0} max={10} min={0} />
                <!-- <Form.Description>This is your public display name.</Form.Description> -->
                <Form.Validation />
            </Form.Item>
        </Form.Field>
        <Form.Field {config} name="password">
            <Form.Item>
                <Form.Label class="text-sm">Threshold Percentage</Form.Label>
                <Form.InputNumber value={0} max={10} min={0} />
                <!-- <Form.Description>This is your public display name.</Form.Description> -->
                <Form.Validation />
            </Form.Item>
        </Form.Field>
    </div>
	<Form.Button class="w-full mt-10 bg-epb hover:bg-epbhover">Login</Form.Button>
</Form.Root>
