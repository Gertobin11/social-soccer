import type { Actions, PageServerLoad } from './$types';
import { redirect } from 'sveltekit-flash-message/server';
import {
	buildGameDataForMap,
	getGameWithPLayers,
	verifyRequestToJoinIsUnique
} from '$lib/server/game';
import { getErrorMessage } from '$lib/client/utils';
import { createRequestToJoin } from '$lib/orm/game';

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
		const gameID = Number(event.params.gameID);

		if (isNaN(gameID)) {
			throw new Error('Invalid GamedID received');
		}

		const game = await getGameWithPLayers(gameID);

		const gameData = await buildGameDataForMap(game);

		return { gameData, game };
	} catch (error) {
		return redirect(
			'/',
			{ type: 'error', message: `Unable to load game request page with ${getErrorMessage(error)}` },
			event
		);
	}
};

export const actions: Actions = {
	default: async (event) => {
		// redirect to the homepage if the user is not signed in
		if (!event.locals.session) {
			return redirect(
				'/',
				{ type: 'error', message: 'You must be signed in to view this page' },
				event
			);
		}

		try {
			const gameID = Number(event.params.gameID);

			if (isNaN(gameID)) {
				throw new Error('Invalid GamedID received');
			}

			await verifyRequestToJoinIsUnique(gameID, event.locals.session.userID);

			await createRequestToJoin(gameID, event.locals.session.userID);
		} catch (error) {
			return redirect(
				'/',
				{ type: 'error', message: `Unable to create join request with ${getErrorMessage(error)}` },
				event
			);
		}

		return redirect('/', { type: 'success', message: `Request sent to Join Game` }, event);
	}
};
