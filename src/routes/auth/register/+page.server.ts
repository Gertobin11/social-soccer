import { fail, message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import { signupSchema } from '$lib/validation/auth';
import {
	createEmailVerificationToken,
	createSession,
	generateToken,
	generateUserId,
	setSessionTokenCookie
} from '$lib/server/auth';
import { hash } from '@node-rs/argon2';
import prisma from '$lib/server/prisma';
import { sendVerificationEmail } from '$lib/server/email';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { getErrorMessage } from '$lib/client/utils';
import { createUser, getUserByEmail } from '$lib/orm/user';

export const load: PageServerLoad = async (event) => {
	// redirect to the homepage if the user already has a session
	if (event.locals.session) {
		return redirect("/", {type: "error", message: "User is already signed in"}, event)
	}
	const form = await superValidate(zod4(signupSchema));

	return { form };
};

export const actions: Actions = {
	register: async (event) => {
		const form = await superValidate(event, zod4(signupSchema));

		if (!form.valid) {
            setFlash({message: "Form is not valid", type: 'error'}, event)
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const userID = generateUserId();
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {

            // check if the user is already registered
            const previousUser = await getUserByEmail(email)
            if(previousUser) {
                throw new Error("Account with this email aready exists")
            }

			await createUser(userID, email, passwordHash);

            // create the email validation token
			const token = await createEmailVerificationToken(userID);
			const url = event.url.origin + '/auth/email-verification/' + token;
			await sendVerificationEmail(email, url);

            // sign the user in to their unverified account
			const sessionToken = generateToken();
			const session = await createSession(sessionToken, userID);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (error) {
           form.message = getErrorMessage(error)
			return fail(500, { form });
		}
		return redirect(
			'/',
			{
				message: 'Registration Successful. Please check your emails to verify account',
				type: "success"
			},
			event
		);
	}
};
