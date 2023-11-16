import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const page = Number(params.page);

	async function getProfiles() {
		const limit = 5;

		const profiles = await db.xfmrTimeInterval.findMany({
			skip: (page - 1) * limit,
			take: limit
		});

		return profiles;
	}

	async function getProfileCount() {
		return await db.xfmrTimeInterval.count();
	}

	await db.xfmrTimeInterval.count();

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
		const start = String(formData.start);
		const end = String(formData.end);

		const errors = [];

		if (name.length < 2 || name.length > 20) {
			errors.push({
				field: 'name',
				message: 'Name must be between 2 and 20 characters'
			});
		}

		if (
			(start === undefined || start === null || start === '')
		) {
			errors.push({
				field: 'start',
				message: 'Please select a valid time of day.'
			});
		}

		if (
			(end === undefined || end === null || end === '')
		) {
			errors.push({
				field: 'end',
				message: 'Please select a valid time of day.'
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

		const currentDate = new Date();
		const dateString = currentDate.toISOString().split('T')[0];

		const startT = new Date(`${dateString}T${start}:00.000Z`).toISOString();
		const endT = new Date(`${dateString}T${end}:00.000Z`).toISOString();

		// Add profile to database
		try {
			await db.xfmrTimeInterval.create({
				data: {
					Name: `${formData.name}`,
					Start: startT,
					End: endT,
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

		const id = formData.id;

		// validate the form values
		const name = formData.name as string;
		const start = String(formData.start);
		const end = String(formData.end);

		const errors = [];

		if (name.length < 2 || name.length > 20) {
			errors.push({
				field: 'name',
				message: 'Name must be between 2 and 20 characters'
			});
		}

		if (
			(start === undefined || start === null || start === '')
		) {
			errors.push({
				field: 'start',
				message: 'Please select a valid time of day.'
			});
		}

		if (
			(end === undefined || end === null || end === '')
		) {
			errors.push({
				field: 'end',
				message: 'Please select a valid time of day.'
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

		const currentDate = new Date();
		const dateString = currentDate.toISOString().split('T')[0];

		const startT = new Date(`${dateString}T${start}:00.000Z`).toISOString();
		const endT = new Date(`${dateString}T${end}:00.000Z`).toISOString();

		// Add profile to database
		try {
			await db.xfmrTimeInterval.update({
				where: {
					ID: Number(id)
				},
				data: {
					Name: `${formData.name}`,
					Start: startT,
					End: endT,
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
			await db.xfmrTimeInterval.delete({
				where: {
					ID: Number(id)
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
};
