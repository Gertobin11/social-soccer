import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';

import { buildGameDataForMap, getGameWithPlayers } from '$lib/server/game';
import { getAddressByID } from '$lib/orm/address';
import { getDecryptedAddress } from '$lib/server/address';
import { getOpenRequestsForGame } from '$lib/orm/game';

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
		let gameID = Number(event.params.gameID);

		if (isNaN(gameID)) {
			throw new Error('Bad id passed to manage game page');
		}

		const game = await getGameWithPlayers(gameID);

		if (game.organiserID !== event.locals.user?.id) {
			throw new Error('Only organisers can view the manage game page');
		}

		const gameData = await buildGameDataForMap(game);

		const encryptedLocation = await getAddressByID(game.locationID);
		const location = getDecryptedAddress(encryptedLocation);

		const openRequests = await getOpenRequestsForGame(game.id);

		return {
			gameData,
			location,
			openRequests
		};
	} catch (error) {
		return redirect(
			'/profile/dashboard',
			{
				type: 'error',
				message: 'Unable to view manage game page, please try again or contact support'
			},
			event
		);
	}
};

