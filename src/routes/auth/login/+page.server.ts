import { createSession, generateToken, setSessionTokenCookie } from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import { loginSchema } from "$lib/validation/auth";
import { verify } from '@node-rs/argon2';
import { fail, superValidate } from "sveltekit-superforms";
import { redirect, setFlash} from "sveltekit-flash-message/server";
import { zod4 } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    // redirect to the homepage if the user already has a session
    if (event.locals.session) {
        return redirect("/", {type: "error", message: "User is already signed in"}, event)
    }
    const form = await superValidate(zod4(loginSchema))

    return {form}
}

export const actions: Actions = {
	login: async (event) => {
		const form = await  superValidate(event, zod4(loginSchema))
		
        if(!form.valid) {
            setFlash({message: "Form is not valid", type: 'error'}, event)
            return fail(400, {form})
        }

		const existingUser = await prisma.user.findUnique({
            where: {
                email: form.data.email
            }
        })

		if (!existingUser) {
            form.message = 'Incorrect username or password'
			return fail(400, { form });
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

		const sessionToken = generateToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect('/', {type:"success", message: "Signed in Successfully"}, event);
	}
}