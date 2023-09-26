import { superValidate } from 'sveltekit-superforms/server';
import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const formSchemaAddProfile = z.object({
	name: z.string().min(2).max(50),
	milesdriven: z.coerce.number().min(5).max(75),
	expenditure: z.coerce.number().min(0)
});

export const load: PageServerLoad = async ({ params }) => {
	const page = Number(params.page);

	async function getProfiles() {
		const limit = 5;

		const profiles = await db.xfmrDriverProfile.findMany({
			skip: (page - 1) * limit,
			take: limit
		});

		return profiles;
	}

	async function getProfileCount() {
		return await db.xfmrDriverProfile.count();
	}

	await db.xfmrDriverProfile.count();

	const stuff = await getProfiles();
	return {
		form: superValidate(formSchemaAddProfile),
		profiles: stuff,
		profileCount: await getProfileCount()
	};
};

export const actions: Actions = {
	addProfile: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		// validate the form values
		const name = formData.name as string;
		const milesdriven = Number(formData.milesdriven);
		const expenditure = Number(formData.expenditure);

		const errors = [];

		if (name.length < 2 || name.length > 50) {
			errors.push('Name must be between 2 and 50 characters');
		}

		if (milesdriven < 5 || milesdriven > 75) {
			errors.push('Miles driven must be between 5 and 75');
		}

		if (expenditure < 0) {
			errors.push('Expenditure cannot be negative');
		}

		if (errors.length > 0) {
			return fail(400, {
				status: 400,
				data: {
					message: 'Invalid field data.',
					errors: errors.map((e, index) => ({
						field: Object.keys(formSchemaAddProfile.shape)[index],
						message: e
					}))
				}
			});
		}

		// Add profile to database
		try {
			await db.xfmrDriverProfile.create({
				data: {
					NAME: `${formData.name}`,
					MILES_DRIVEN: Number(`${formData.milesdriven}`),
					KVA_EXPENDITURE: Number(`${formData.expenditure}`)
				}
			});
		} catch (e) {
			console.log(e);
		}
		return {
			message: 'Profile added successfully'
		};
	},
	editProfile: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		// validate the form values
		const id = Number(formData.id);
		const name = formData.name as string;
		const milesdriven = Number(formData.milesdriven);
		const expenditure = Number(formData.expenditure);

		const errors = [];

		if (name.length < 2 || name.length > 50) {
			errors.push('Name must be between 2 and 50 characters');
		}

		if (milesdriven < 5 || milesdriven > 75) {
			errors.push('Miles driven must be between 5 and 75');
		}

		if (expenditure < 0) {
			errors.push('Expenditure cannot be negative');
		}

		if (errors.length > 0) {
			return fail(400, {
				status: 400,
				data: {
					message: 'Invalid field data.',
					errors: errors.map((e, index) => ({
						field: Object.keys(formSchemaAddProfile.shape)[index],
						message: e
					}))
				}
			});
		}

		// Add profile to database
		try {
			await db.xfmrDriverProfile.update({
				where: {
					ID: id
				},
				data: {
					NAME: `${formData.name}`,
					MILES_DRIVEN: Number(`${formData.milesdriven}`),
					KVA_EXPENDITURE: Number(`${formData.expenditure}`)
				}
			});
		} catch (e) {
			console.log(e);
		}
		return {
			message: 'Profile updated successfully.'
		};
	},
	deleteProfile: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const id = formData.id;

		try {
			await db.xfmrDriverProfile.delete({
				where: {
					ID: Number(id)
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
};
