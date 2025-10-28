import { redirect } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { createGameSchema } from '$lib/validation/game';
import { addressSchema } from '$lib/validation/auth';
import { createAddressFromForm } from '$lib/server/address';

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

	return { gameDetailsForm, addressForm };
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

        const addressForm = await superValidate(event, zod4(addressSchema))

        if(!addressForm.valid) {
            return fail(400, {addressForm, message: "Form not valid"})
        }

        const addressID = await createAddressFromForm(addressForm)
        addressForm.data.addressID = addressID

        return message(addressForm, "Address Validated")
	}
};
