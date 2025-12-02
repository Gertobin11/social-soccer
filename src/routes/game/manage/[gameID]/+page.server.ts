import { redirect } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad, RouteParams } from './$types';

import {
	buildGameDataForMap,
	getGameWithPlayers,
	verifyUserIsOrganiserOfGame
} from '$lib/server/game';
import { getAddressByID } from '$lib/orm/address';
import { getDecryptedAddress } from '$lib/server/address';
import {
	getOpenRequestsForGame,
	getRequestToJoinByID,
	addPlayerToGame,
	updateRequestToJoin,
	deleteRequestToJoin,
	removePlayerFromGame
} from '$lib/orm/game';
import { createRating, getRating, updateRating } from '$lib/orm/user';
import { getNumberFromFormData, getStringFromFormData } from '$lib/server/utils';

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
			openRequests,
			players: game.players
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

export const actions: Actions = {
	remove: async (event) => {
		let gameID = Number(event.params.gameID);
		try {
			if (!event.locals.session) {
				throw new Error('User was not logged in');
			}

			const formData = await event.request.formData();
			const playerID = getStringFromFormData(formData, 'playerID');

			await verifyUserIsOrganiserOfGame(gameID, event.locals.session.userID);
			// remove the player and the request used to join the game
			await removePlayerFromGame(gameID, playerID);
			await deleteRequestToJoin(gameID, playerID);
		} catch (error) {
			return redirect(
				`/game/manage/${gameID}`,
				{
					type: 'error',
					message: 'Unable to remove player from game, please contact support'
				},
				event
			);
		}

		return redirect(
			`/game/manage/${gameID}`,
			{
				type: 'success',
				message: 'Successfully removed player from the game'
			},
			event
		);
	},
	rate: async (event) => {
		let gameID = Number(event.params.gameID);
		let message: string;
		try {
			if (!event.locals.session) {
				throw new Error('User was not logged in');
			}

			const formData = await event.request.formData();
			const rating = getNumberFromFormData(formData, 'rating');
			const playerID = getStringFromFormData(formData, 'playerID');

			await verifyUserIsOrganiserOfGame(gameID, event.locals.session.userID);

			const previousRating = await getRating(playerID, gameID);

			if (previousRating) {
				await updateRating(playerID, gameID, rating);
				message = `Successfully updated rating to ${rating}`;
			} else {
				await createRating(playerID, gameID, rating);
				message = `Successfully created rating of ${rating}`;
			}
		} catch (error) {
			return redirect(
				`/game/manage/${gameID}`,
				{
					type: 'error',
					message: 'Unable to rate player, please contact support'
				},
				event
			);
		}

		return redirect(
			`/game/manage/${gameID}`,
			{
				type: 'success',
				message
			},
			event
		);
	},
	accept: async (event) => {
		let gameID = Number(event.params.gameID);
		try {
			if (!event.locals.session) {
				throw new Error('User was not logged in');
			}

			const formData = await event.request.formData();
			const requestID = getNumberFromFormData(formData, 'requestID');

			const gameRequest = await getRequestToJoinByID(requestID);
			if (!gameRequest) {
				throw new Error('Request not found');
			}

			await verifyUserIsOrganiserOfGame(gameRequest.gameID, event.locals.session.userID);
			await addPlayerToGame(gameRequest.gameID, gameRequest.playerID);
			await updateRequestToJoin(gameRequest.id, true);
		} catch (error) {
			return redirect(
				`/game/manage/${gameID}`,
				{
					type: 'error',
					message: 'Unable to accept request to join, please contact support'
				},
				event
			);
		}

		return redirect(
			`/game/manage/${gameID}`,
			{
				type: 'success',
				message: 'Request to join accepted successfully'
			},
			event
		);
	},
	reject: async (event) => {
		let gameID = Number(event.params.gameID);
		try {
			if (!event.locals.session) {
				throw new Error('User was not logged in');
			}

			const formData = await event.request.formData();
			const requestID = getNumberFromFormData(formData, 'requestID');

			const gameRequest = await getRequestToJoinByID(requestID);
			if (!gameRequest) {
				throw new Error('Request not found');
			}

			await verifyUserIsOrganiserOfGame(gameRequest.gameID, event.locals.session.userID);
			await updateRequestToJoin(gameRequest.id, false);
		} catch (error) {
			return redirect(
				`/game/manage/${gameID}`,
				{
					type: 'error',
					message: 'Unable to reject request to join, please contact support'
				},
				event
			);
		}

		return redirect(
			`/game/manage/${gameID}`,
			{
				type: 'success',
				message: 'Request to join rejected successfully'
			},
			event
		);
	}
};
