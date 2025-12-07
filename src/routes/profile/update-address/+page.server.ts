import { redirect } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addressSchema } from '$lib/validation/auth';
import { createAddressFromForm, getDecryptedAddress } from '$lib/server/address';
import { addAddressToUser, getUserByID } from '$lib/orm/user';
import { getCoordinateByID } from '$lib/orm/address';
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

	try {
		const user = await getUserByID(event.locals.session.userID);

		if (!user) {
			throw new Error('No user found');
		}

		if (!user.address) {
			throw new Error('User does not have an address to update');
		}
		const { lineOne, lineTwo, city, eircode, county, country } = getDecryptedAddress(user.address);

		const coordiantes = await getCoordinateByID(user.address.coordinatesID);

		// populate the form with the saved address
		const addressForm = await superValidate(zod4(addressSchema), {
			defaults: {
				lineOne: lineOne || '',
				lineTwo: lineTwo || '',
				city: city || '',
				county: county || '',
				country: country || '',
				eircode: eircode || '',
				latitude: coordiantes.location.coordinates[0],
				longitude: coordiantes.location.coordinates[1],
				addressID: user.address.id
			}
		});

        const googleMapAPIKey = env.GOOGLE_MAP_API_KEY

		return { addressForm, googleMapAPIKey };
	} catch (error) {
		return redirect(
			'/',
			{ type: 'error', message: 'Unable to load update address form, please contact support' },
			event
		);
	}
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
			{ type: 'success', message: 'Address updated successsfully' },
			event
		);
	}
};
