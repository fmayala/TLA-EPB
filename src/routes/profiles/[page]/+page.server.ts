import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
		const interval = Number(formData.interval);

		const errors = [];

		if (name.length < 2 || name.length > 20) {
			errors.push({
				field: 'name',
				message: 'Name must be between 2 and 20 characters'
			});
		}

		if (milesdriven < 5 || milesdriven > 75) {
			errors.push({
				field: 'milesdriven',
				message: 'Miles driven must be between 5 and 75'
			});
		}

		if (expenditure < 0) {
			errors.push({
				field: 'expenditure',
				message: 'Expenditure cannot be negative'
			});
		}

		if (interval < 0) {
			errors.push({
				field: 'interval',
				message: 'Interval cannot be negative'
			});
		}

		if (errors.length > 0) {
			return fail(400, {
				status: 400,
				data: {
					message: 'Invalid field data.',
					errors: errors
				}
			});
		}

		// Add profile to database
		try {
			await db.xfmrDriverProfile.create({
				data: {
					NAME: `${formData.name}`,
					MILES_DRIVEN: Number(`${formData.milesdriven}`),
					KWH_EXPENDITURE: Number(`${formData.expenditure}`),
					XfmrTimeInterval: {
						connect: {
							ID: Number(`${formData.interval}`)
						}
					}
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

		const id = Number(formData.id);
		// validate the form values
		const name = formData.name as string;
		const milesdriven = Number(formData.milesdriven);
		const expenditure = Number(formData.expenditure);
		const interval = Number(formData.interval);

		const errors = [];

		if (name.length < 2 || name.length > 20) {
			errors.push({
				field: 'name',
				message: 'Name must be between 2 and 20 characters'
			});
		}

		if (milesdriven < 5 || milesdriven > 75) {
			errors.push({
				field: 'milesdriven',
				message: 'Miles driven must be between 5 and 75'
			});
		}

		if (expenditure < 0) {
			errors.push({
				field: 'expenditure',
				message: 'Expenditure cannot be negative'
			});
		}

		if (interval < 0) {
			errors.push({
				field: 'interval',
				message: 'Interval cannot be negative'
			});
		}

		if (errors.length > 0) {
			return fail(400, {
				status: 400,
				data: {
					message: 'Invalid field data.',
					errors: errors
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
					KWH_EXPENDITURE: Number(`${formData.expenditure}`),
					XfmrTimeInterval: {
						connect: {
							ID: Number(`${formData.interval}`)
						}
					}
				}
			});
		} catch (e) {
			console.log(e);
		}
		return {
			message: 'Profile updated successfully'
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
