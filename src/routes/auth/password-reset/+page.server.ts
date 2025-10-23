import { loginSchema, passwordResetSchema } from '$lib/validation/auth';

import { fail, superValidate } from 'sveltekit-superforms';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { generatePasswordResetToken } from '$lib/server/auth';
import { sendPasswordRestEmail } from '$lib/server/email';
import { getErrorMessage } from '$lib/client/utils';

export const load: PageServerLoad = async (event) => {
	// redirect to the homepage if the user already has a session
	if (event.locals.session) {
		return redirect('/', { type: 'error', message: 'User is already signed in' }, event);
	}
	const form = await superValidate(zod4(loginSchema));

	return { form };
};

export const actions: Actions = {
	reset: async (event) => {
		const form = await superValidate(event.request, zod4(passwordResetSchema));
		try {
			if (!form.valid) {
				throw new Error('Form not valid');
			}
			const email = form.data.email.toLowerCase();
			const user = await prisma.user.findFirst({ where: { email: email } });
			if (user) {
				const token = await generatePasswordResetToken(user.id);
				const url = event.url.origin + '/auth/password-reset/' + token;
				await sendPasswordRestEmail(user.email, url);
			}

			// send a generic message to not leak customer data
			setFlash(
				{
					type: 'success',
					message: `If user with matching email exists, a password reset link will be sent`
				},
				event
			);
			return {
				success: true,
				form
			};
		} catch (error) {
			setFlash({ type: 'error', message: `${getErrorMessage(error)}` }, event);
			return fail(400, { form });
		}
	}
};
