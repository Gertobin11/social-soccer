import { redirect } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { createGameSchema } from '$lib/validation/game';
import { addressSchema } from '$lib/validation/auth';
import { createAddressFromForm } from '$lib/server/address';
import { createGameFromForm } from '$lib/server/game';
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
	const gameDetailsForm = await superValidate(zod4(createGameSchema));
	const addressForm = await superValidate(zod4(addressSchema));
    const googleMapAPIKey = env.GOOGLE_MAP_API_KEY

	return { gameDetailsForm, addressForm, googleMapAPIKey };
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
		// handle any unexpected issues writing to the database
		try {
			const addressID = await createAddressFromForm(addressForm);
			addressForm.data.addressID = addressID;

			return message(addressForm, 'Address Validated');
		} catch (error) {
			return fail(500, { addressForm, message: 'Unexpected Error, please contact support' });
		}
	},

	createGame: async (event) => {
		// redirect to the homepage if the user is not signed in
		if (!event.locals.session) {
			return redirect(
				'/',
				{ type: 'error', message: 'You must be signed in to view this page' },
				event
			);
		}

		let gameID: number;
		const userID = event.locals.user?.id;
		if (!userID) {
			return redirect(
				'/',
				{ type: 'error', message: 'No record of user in the logged in session' },
				event
			);
		}

		const gameDetailsForm = await superValidate(event, zod4(createGameSchema));

		// handle any unexpected issues writing to the database
		if (!gameDetailsForm.valid) {
			return fail(400, { gameDetailsForm, message: 'Form not valid' });
		}
		try {
			let game = await createGameFromForm(gameDetailsForm, userID);
			gameID = game.id;
		} catch (error) {
			return fail(500, { gameDetailsForm, message: 'Unexpected Error, please contact support' });
		}

		let location = gameID ? `/game/view/${gameID}` : '/';
		return redirect(location, { type: 'success', message: 'Game Created Successfully!' }, event);
	}
};
