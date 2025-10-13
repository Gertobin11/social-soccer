import { createSession, generateToken, setSessionTokenCookie, validateEmailVerificationToken } from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";
import { redirect } from "sveltekit-flash-message/server";

export const load: PageServerLoad = async (event) => {
    let message: {message: string, type: "error" | "success"}
		try {
			const params = event.params;
			const token = params.token;

			if (!token) {
				throw new Error('Token missing on request');
			}

			const userID = await validateEmailVerificationToken(token);

			await prisma.user.update({
				where: {
					id: userID
				},
				data: {
					emailVerified: true
				}
			});

			const sessionToken: string = generateToken();

			const session = await createSession(sessionToken, userID);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
            message = {type: "success", message: "Email has been verified"}

		} catch (errorObject) {
			// TODO log errors
			message = {type: "error", message: "Unable to verify email, please try again or contact support"}
		}

		redirect(302, "/", message, event);
	}