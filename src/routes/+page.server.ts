import { superValidate } from 'sveltekit-superforms/server';
import { formSchema, formSchemaSearch } from '../forms/schema';
import type { Actions} from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
/** @type {import('./$types').PageServerLoad} */
export async function load({ params, request }) {
	return {
		generate: superValidate(formSchema),
		search: superValidate(formSchemaSearch),
	};
}

export const actions: Actions = {
	generate: async ({ request }) => {
		const formdata = await request.formData();
		const form = await superValidate(formdata, formSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		return {
			form
		};
	},
};
