import { hash, verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import * as auth from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { loginSchema, signupSchema } from '$lib/validation/auth';
import { generateUserId } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/demo/lucia');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const form = await  superValidate(event, zod4(loginSchema))
		
        if(!form.valid) {
            return fail(400, {form})
        }

		const existingUser = await prisma.user.findUnique({
            where: {
                email: form.data.email
            }
        })

		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password', form });
		}

		const validPassword = await verify(existingUser.passwordHash, form.data.password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password', form });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/demo/lucia');
	},

	register: async (event) => {
        const form = await  superValidate(event, zod4(signupSchema))
		
        if(!form.valid) {
            return fail(400, {form})
        }

        const {email, password} = form.data

		const userID = generateUserId();
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
            await prisma.user.create({
                data: {
                    id: userID,
                    email,
                    emailVerified: false,
                    passwordHash,
                }
            })


			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userID);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch {
			return fail(500, { message: 'An error has occurred' , form});
		}
		return redirect(302, '/demo/lucia');
	}
};
