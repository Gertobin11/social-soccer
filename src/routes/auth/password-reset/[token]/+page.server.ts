import prisma from "$lib/server/prisma";
import { DateTime } from "luxon";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { passwordResetSchema } from "$lib/validation/auth";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { getErrorMessage } from "$lib/client/utils";

export const load: PageServerLoad = async (event) => {
    try {
        // retrieve the password reset token from the url param
        const passwordResetToken = await prisma.passwordResetToken.findUnique({
            where: {
                token: event.params.token
            }
        })

        if(!passwordResetToken) {
            throw new Error("Invalid token in url")
        }

        const now = DateTime.now().toMillis()

        if (passwordResetToken.expiresAt.getTime() > now ) {
            throw new Error("Token has expired")
        }

        const form = await superValidate(zod4(passwordResetSchema)) 
        return {form}
    } catch (error) {
        redirect("/", {message: `Unable to load Password Reset Form with Error: ${getErrorMessage(error)}`, type: "error"}, event)
    }
}