import { redirect } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { profileSchema } from '$lib/validation/auth';
import { addNamesToUser, getUserByID } from '$lib/orm/user';

export const load: PageServerLoad = async (event) => {
	// redirect to the homepage if the user is not signed in
	if (!event.locals.session) {
		return redirect(
			'/',
			{ type: 'error', message: 'You must be signed in to view this page' },
			event
		);
	}

	try {
		const user = await getUserByID(event.locals.session.userID);

		if (!user) {
			throw new Error('No user found');
		}

		// populate the form with the users details
		const profileForm = await superValidate(zod4(profileSchema), {
			defaults: {
				firstName: user.firstName || '',
				lastName: user.lastName || ''
			}
		});

		return { profileForm };
	} catch (error) {
		return redirect(
			'/',
			{ type: 'error', message: 'Unable to load update profile form, please contact support' },
			event
		);
	}
};

export const actions: Actions = {
	updateUserDetailss: async (event) => {
		// redirect to the homepage if the user is not signed in
		if (!event.locals.session) {
			return redirect(
				'/',
				{ type: 'error', message: 'You must be signed in to view this page' },
				event
			);
		}

		const user = await getUserByID(event.locals.session.userID);

		if (!user) {
			throw new Error('No user found');
		}

		const profileForm = await superValidate(event, zod4(profileSchema));

		if (!profileForm.valid) {
			return fail(400, { profileForm, message: 'Form not valid' });
		}

		// handle unexpected errors writing to the database
		try {
			await addNamesToUser(user.id, profileForm.data.firstName, profileForm.data.lastName);
		} catch (error) {
			return fail(500, { profileForm, message: 'Unexpected Error, please contact support' });
		}

		return redirect(
			'/profile/dashboard',
			{ type: 'success', message: 'Profile updated successsfully' },
			event
		);
	}
};
