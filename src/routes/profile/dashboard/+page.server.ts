import { getErrorMessage } from '$lib/client/utils';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import type { Address } from '@prisma/client';
import { getDecryptedAddress } from '$lib/server/address';
import { getUserByID } from '$lib/orm/user';
import { getDecryptedUserDetails } from '$lib/server/user';

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
			throw new Error(`User with id: ${event.locals.session.userID} not found`);
		}

		let address: Partial<Address> | undefined;

		if (user.address) {
			address = getDecryptedAddress(user.address);
		}

        const userDetails = await getDecryptedUserDetails(user)

		return { userDetails, address };
	} catch (error) {
		return redirect(
			'/',
			{ type: 'error', message: `Unable to load dashboard with ${getErrorMessage(error)}` },
			event
		);
	}
};
