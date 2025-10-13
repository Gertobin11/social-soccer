import { getErrorMessage } from '$lib/client/utils';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';
import { getUserByID } from '$lib/server/user';
import { fail, type Actions } from '@sveltejs/kit';

import { redirect } from 'sveltekit-flash-message/server';

export const actions: Actions = {
	logout: async (event) => {
		let message: { type: 'error' | 'success'; message: string };
		try {
			const session = event.locals.session;
			if (!session) return fail(401);
			const user = await getUserByID(session.userID);
			await invalidateSession(session.token);
			deleteSessionTokenCookie(event);

			message = { type: 'success', message: `${user ? user.email : 'User'} has logged out` };
		} catch (error) {
			message = {
				type: 'error',
				message: `Encountered error while logging out: ${getErrorMessage(error)}`
			};
		}
		redirect('/', message, event);
	}
};
