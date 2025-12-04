import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { buildGameDataForMap, type MapGameData } from '$lib/server/game';
import { getLatestGames } from '$lib/orm/game';
import { superValidate } from 'sveltekit-superforms';
import { filterGameSchema } from '$lib/validation/game';
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async (event) => {
	// set the logged in state for showing additional functionality 
    // to the user if logged in
	const loggedIn = event.locals.session !== null

	try {
        const form = await superValidate(zod4(filterGameSchema))
		const gameDataArray: MapGameData[] = [];
		const games = await getLatestGames(100);

		for (let game of games) {
			gameDataArray.push(await buildGameDataForMap(game));
		}
		return { gameDataArray, loggedIn, form };
	} catch (errorObject) {
		return redirect(
			'/',
			{ type: 'error', message: ' Unable to load map, please contact support' },
			event
		);
	}
};
