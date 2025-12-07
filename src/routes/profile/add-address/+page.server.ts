import { redirect } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addressSchema } from '$lib/validation/auth';
import { createAddressFromForm } from '$lib/server/address';
import { addAddressToUser } from '$lib/orm/user';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (event) => {
	// redirect to the homepage if the user is not signed in
	if (!event.locals.session) {
		return redirect(
			'/',
			{ type: 'error', message: 'You must be signed in to view this page' },
			event
		);
	}
	const addressForm = await superValidate(zod4(addressSchema));
    const googleMapAPIKey = env.GOOGLE_MAP_API_KEY

	return { addressForm, googleMapAPIKey };
};

export const actions: Actions = {
	createAddress: async (event) => {
		// redirect to the homepage if the user is not signed in
		if (!event.locals.session) {
			return redirect(
				'/',
				{ type: 'error', message: 'You must be signed in to view this page' },
				event
			);
		}

		const addressForm = await superValidate(event, zod4(addressSchema));

		if (!addressForm.valid) {
			return fail(400, { addressForm, message: 'Form not valid' });
		}

        // handle unexpected errors writing to the database
		try {
			const addressID = await createAddressFromForm(addressForm);
			await addAddressToUser(event.locals.session.userID, addressID);
		} catch (error) {
			return fail(500, { addressForm, message: 'Unexpected Error, please contact support' });
		}

		return redirect(
			'/profile/dashboard',
			{ type: 'success', message: 'You must be signed in to view this page' },
			event
		);
	}
};
