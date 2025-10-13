import { loadFlash } from 'sveltekit-flash-message/server';
export const load = loadFlash(async (event) => {
	// get the stored session and return it to the frontend
	const session = event.locals.session;

	return { session };
});
