import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { redirect } from 'sveltekit-flash-message/server';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

    // check that a user is verified and has completed there profile
	if (user) {
		if (user.emailVerified === false) {
			// TODO redirect to verify email page
		}
		if (!user.firstName || !user.lastName || !user.addressID) {
			// TODO handle and redirect user to complete profile
		}
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = handleAuth;
