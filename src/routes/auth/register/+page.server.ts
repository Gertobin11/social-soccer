import { fail, superValidate } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { zod4 } from "sveltekit-superforms/adapters";
import { signupSchema } from "$lib/validation/auth";
import { createEmailVerificationToken, createSession, generateToken, generateUserId, setSessionTokenCookie } from "$lib/server/auth";
import { hash } from "@node-rs/argon2";
import prisma from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";
import { create } from "domain";

export const load: PageServerLoad = async (event) => {
    // redirect to the homepage if the user already has a session
    if (event.locals.session) {
        return redirect(302, "/")
    }
    const form = await superValidate(zod4(signupSchema))

    return {form}
}

export const actions: Actions = {
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

            const token = await createEmailVerificationToken(userID)
			// const sessionToken = generateToken();
			// const session = await createSession(sessionToken, userID);
			// setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch {
			return fail(500, { message: 'An error has occurred' , form});
		}
		return redirect(302, '/demo/lucia');
	}
};
