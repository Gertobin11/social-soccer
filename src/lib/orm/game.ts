import prisma from '$lib/server/prisma';
import type { Level } from '@prisma/client';

export async function createGame(
	day: string,
	active: boolean,
	time: string,
	numberOfPlayers: number,
	organiserID: string,
	level: Level,
	addressID: number
) {
	await prisma.game.create({
		data: {
			day,
			active,
			time,
			numberOfPlayers,
			organiserID,
			level,
			locationID: addressID,
			players: { connect: { id: organiserID } }
		}
	});
}

export async function getGameByID(gameID: number) {
	return await prisma.game.findUnique({
		where: {
			id: gameID
		},
		include: {
			players: true
		}
	});
}

export async function getRequestToJoin(gameID: number, userID: string) {
	return await prisma.requestToJoin.findUnique({
		where: {
			requestToPlayer: { gameID, playerID: userID }
		}
	});
}

export async function createRequestToJoin(gameID: number, userID: string) {
	await prisma.requestToJoin.create({
		data: {
			gameID,
			playerID: userID
		}
	});
}

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
		}
	});
}

export async function getLatestGames(limit: number) {
	return await prisma.game.findMany({ take: limit, orderBy: { createdOn: 'desc' }, include: {players: true} });
}

export async function getOpenGameRequestForAdmin(organiserID: string) {
	return await prisma.requestToJoin.findMany({
		where: {
			accepted: undefined,
			game: {
				organiserID
			}
		},
		include: { game: true, player: { include: { ratings: true } } }
	});
}

export async function getManagedGames(organiserID: string) {
	return await prisma.game.findMany({
		where: {
			organiserID
		},
		include: {
			location: true,
			players: true
		}
	});
}

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
		include: {
			location: true,
			players: true
		}
	});
}
