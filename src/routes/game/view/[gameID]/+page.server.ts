import type { Actions, PageServerLoad } from './$types';
import { redirect } from 'sveltekit-flash-message/server';
import {
	buildGameDataForMap,
	getGameWithPlayers,
	verifyRequestToJoinIsUnique
} from '$lib/server/game';
import { getErrorMessage } from '$lib/client/utils';
import {
	createRequestToJoin,
	deleteRequestToJoin,
	getGameByID,
	getRequestToJoin,
	removePlayerFromGame
} from '$lib/orm/game';
import { getDecryptedAddress } from '$lib/server/address';
import { getAddressByID } from '$lib/orm/address';

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

		const game = await getGameWithPlayers(gameID);

		const gameData = await buildGameDataForMap(game);

		const encryptedLocation = await getAddressByID(game.locationID);
		const location = getDecryptedAddress(encryptedLocation);

		const isOwner = game.organiserID === event.locals.session.userID;

		const isCurrentPlayer =
			game.players.filter((player) => player.id === event.locals.session?.userID).length === 1;

		const joinRequest = await getRequestToJoin(game.id, event.locals.session.userID);

		const hasOpenRequest = joinRequest !== null && joinRequest.accepted === null;

		return { gameData, game, location, isOwner, isCurrentPlayer, hasOpenRequest };
	} catch (error) {
		return redirect(
			'/',
			{ type: 'error', message: `Unable to load game request page with ${getErrorMessage(error)}` },
			event
		);
	}
};

export const actions: Actions = {
	join: async (event) => {
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

		return redirect(
			`/game/view/${event.params.gameID}`,
			{ type: 'success', message: `Request sent to Join Game` },
			event
		);
	},

	cancel: async (event) => {
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
			const userID = event.locals.session.userID;

			if (isNaN(gameID)) {
				throw new Error('Invalid GamedID received');
			}

			const game = await getGameByID(gameID);

			if (!game) {
				throw new Error(`Game does not exist with the passed id: ${gameID}`);
			}

			const playerInGame = game.players.find((player) => player.id === userID);

			if (!playerInGame) {
				throw new Error(`Player with user id: ${userID} is not in this game, game id : ${gameID}`);
			}

			// remove the player and the request used to join the game
			await removePlayerFromGame(gameID, userID);
			await deleteRequestToJoin(gameID, userID);
		} catch (error) {
			return redirect(
				'/',
				{
					type: 'error',
					message: `Unable to be removed from the game with error: ${getErrorMessage(error)}`
				},
				event
			);
		}

		return redirect(
			`/game/view/${event.params.gameID}`,
			{ type: 'success', message: `You have successfully been removed fro the game` },
			event
		);
	}
};
