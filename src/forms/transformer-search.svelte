<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { formSchemaSearch, type FormSchemaSearch } from './schema';
	import type { SuperValidated } from 'sveltekit-superforms';
	export let form: SuperValidated<FormSchemaSearch>;
</script>

<Form.Root method="POST" {form} action="?/search" schema={formSchemaSearch} let:config class="mt-5">
    <div class="flex flex-row">
        <Form.Field {config} name="sid">
            <Form.Item class="w-full">
                <Form.Input placeholder="Enter Transformer ID (XFMR SID)"/>
                <!-- <Form.Description>This is your public display name.</Form.Description> -->
                <Form.Validation />
            </Form.Item>
        </Form.Field>
        <Form.Button class="ml-5 bg-epb hover:bg-epbhover">Search</Form.Button>
    </div>
</Form.Root>
