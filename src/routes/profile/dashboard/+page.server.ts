import { getErrorMessage } from '$lib/client/utils';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import type { Address } from '@prisma/client';
import { decrypt } from '$lib/server/encryption';
import { getDecryptedAddress } from '$lib/server/address';

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
		const user = await prisma.user.findUnique({
			where: { id: event.locals.session.userID },
			include: { games: true, address: true }
		});

		if (!user) {
			throw new Error(`User with id: ${event.locals.session.userID} not found`);
		}

		let address: Partial<Address> | undefined;

		if (user.address) {
			address = getDecryptedAddress(user.address);
		}

		return { user, address };
	} catch (error) {
		return redirect(
			'/',
			{ type: 'error', message: `Unable to load dashboard with ${getErrorMessage(error)}` },
			event
		);
	}
};
