import prisma from '$lib/server/prisma';
import type { Level, Prisma } from '@prisma/client';

const gameRelatedFields = {
	players: {
		include: { ratings: true }
	},
	location: {
		include: {
			coordinates: true
		}
	}
};

/**
 * Function that creates a record of a game in the database
 * @param day the day the game is on i.e. "Monday"
 * @param active boolean to indicate if the game is currently active
 * @param time the time the game is on .e. "19.00"
 * @param numberOfPlayers the number of players required to play the game
 * @param organiserID the id of the User who organises the game
 * @param level the level at which the game is palyed at i.e. "BEGINNER" or "ADVANCED"
 * @param addressID the id of the location of the game
 * @returns Promise<GameWithRelatedFields>
 */

export async function createGame(
	day: string,
	active: boolean,
	time: string,
	numberOfPlayers: number,
	organiserID: string,
	level: Level,
	addressID: number
) {
	return await prisma.game.create({
		data: {
			day,
			active,
			time,
			numberOfPlayers,
			organiserID,
			level,
			locationID: addressID,
			players: { connect: { id: organiserID } }
		},
		include: gameRelatedFields
	});
}

/**
 * Function that returns the matching Game with the corresponding ID or null
 * @param gameID the id of the game requested
 * @returns Promise<GameWithRelatedFields>
 */
export async function getGameByID(gameID: number) {
	return await prisma.game.findUnique({
		where: {
			id: gameID
		},
		include: gameRelatedFields
	});
}

/**
 * Function that takes in a gameID and userID and uses this unique combination
 * to return a matching RequestToJoin record or null
 * @param gameID the id of the game
 * @param userID the id of the user
 * @returns Promise<RequestToJoin | null>
 */
export async function getRequestToJoin(gameID: number, userID: string) {
	return await prisma.requestToJoin.findUnique({
		where: {
			requestToPlayer: { gameID, playerID: userID }
		},
		include: { game: { include: gameRelatedFields } }
	});
}

/**
 * Function that queries the database for a RequestToJoin Record , using the id
 * @param id the id of the request
 *  @returns Promise<RequestToJoin | null>
 */
export async function getRequestToJoinByID(id: number) {
	return await prisma.requestToJoin.findUnique({
		where: {
			id
		}
	});
}

/**
 * Function that creates a record of a request to join a game in the database
 * @param gameID the id of the game that the request is for
 * @param userID the id of the user making the request
 * @returns Promise<RequestToJoin>
 */
export async function createRequestToJoin(gameID: number, userID: string) {
	return await prisma.requestToJoin.create({
		data: {
			gameID,
			playerID: userID
		}
	});
}

/**
 * Function that adds a player to the games players
 * @param gameID the ID of the game that the payer is being added to
 * @param userID the ID of the user being added to the game
 * @returns Promise<Game>
 */
export async function addPlayerToGame(gameID: number, userID: string) {
	return await prisma.game.update({
		where: {
			id: gameID
		},
		data: {
			players: {
				connect: {
					id: userID
				}
			}
		},
		include: gameRelatedFields
	});
}

/**
 * Function that returns the latest games created
 * @param limit the number of games to be returned
 * @returns Promise<GameWithRelatedFields[]>
 */
export async function getLatestGames(limit: number) {
	return await prisma.game.findMany({
		take: limit,
		orderBy: { createdOn: 'desc' },
		include: gameRelatedFields
	});
}

/**
 * Function that returns all the request to join games that belong to the organiser that matches the passed ID
 * @param organiserID the ID of the organiser
 * @returns Promise<RequestToJoin[]>
 */
export async function getOpenGameRequestForAdmin(organiserID: string) {
	return await prisma.requestToJoin.findMany({
		where: {
			accepted: null,
			game: {
				organiserID
			}
		},
		include: { game: { include: gameRelatedFields }, player: { include: { ratings: true } } }
	});
}

/**
 * Function that returns all the games that the passed id is the organiser of
 * @param organiserID the id of the organiser who manages the games
 * @returns Promise<GameWithRelatedFields[]>
 */
export async function getManagedGames(organiserID: string) {
	return await prisma.game.findMany({
		where: {
			organiserID
		},
		include: gameRelatedFields
	});
}

/**
 * Function that returns all the games where the player with the passed ID is participating in
 * @param playerID the id of the player
 * @returns Promise<GameWithRelatedFields[]>
 */
export async function getGamesParticipatingIn(playerID: string) {
	return await prisma.game.findMany({
		where: {
			organiserID: { not: playerID },
			players: {
				some: {
					id: playerID
				}
			}
		},
		include: gameRelatedFields,
		orderBy: { id: 'asc' }
	});
}

export type GameWithRelatedFields = Prisma.GameGetPayload<{
	include: {
		players: {
			include: { ratings: true };
		};
		location: {
			include: {
				coordinates: true;
			};
		};
	};
}>;

/**
 * Should return a game if its ID is in the Array
 * @param gameIDs an array of ids from game.s
 * @returns Promise<GameWithRelatedFields[]
 */
export async function getGamesWithMatchingIDs(gameIDs: number[]): Promise<GameWithRelatedFields[]> {
	return await prisma.game.findMany({
		where: {
			id: { in: gameIDs }
		},
		include: gameRelatedFields
	});
}

/**
 * Function that removes a user from a game
 * @param gameID the ID of the game that the player is to be removed from
 * @param userID the id of the user to be removed from the game
 */
export async function removePlayerFromGame(gameID: number, userID: string) {
	await prisma.game.update({
		where: {
			id: gameID
		},
		data: {
			players: {
				disconnect: {
					id: userID
				}
			}
		}
	});
}

/**
 * Function that sets the status of whether the request to join has been acccepted or not
 * @param requestID the id of the request to be updated
 * @param accepted the status to be set on the request
 * @returns Promise<RequestToJoin>
 */
export async function updateRequestToJoin(requestID: number, accepted: boolean) {
	return await prisma.requestToJoin.update({
		where: { id: requestID },
		data: {
			accepted
		}
	});
}

/**
 * Function tht deletes a request to join a game
 * @param gameID the ID of the game that the request is to
 * @param playerID the ID of the player that the request is from
 */
export async function deleteRequestToJoin(gameID: number, playerID: string) {
	await prisma.requestToJoin.delete({
		where: {
			requestToPlayer: {
				playerID,
				gameID
			}
		}
	});
}

/**
 * Function that returns every requestToJoin that has nott set a value on accepted
 * @param gameID the ID of the game
 * @returns Promise<RequestToJoin[]>
 */
export async function getOpenRequestsForGame(gameID: number) {
	return await prisma.requestToJoin.findMany({
		where: {
			gameID: gameID,
			accepted: null
		},
		include: { game: { include: gameRelatedFields } }
	});
}
