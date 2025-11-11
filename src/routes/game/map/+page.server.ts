import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { buildGameDataForMap, getLatestGames, type GameData } from '$lib/server/game';

export const load: PageServerLoad = async (event) => {
	// redirect to the homepage if the user is not signed in
	if (!event.locals.session) {
		return redirect(
			'/',
			{ type: 'error', message: 'You must be signed in to view this page' },
			event
		);
	}

	try {
		const gameDataArray: GameData[] = [];
		const games = await getLatestGames(20);

		for (let game of games) {
			gameDataArray.push(await buildGameDataForMap(game));
		}
		return { gameDataArray };
	} catch (errorObject) {
		return redirect(
			'/',
			{ type: 'error', message: ' Unable to load map, please contact support' },
			event
		);
	}
};
