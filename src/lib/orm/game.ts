import prisma from '$lib/server/prisma';
import type { Level, Prisma } from '@prisma/client';

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
			players: {
                include: {
                    ratings: true
                }
            }
		}
	});
}

export async function getRequestToJoin(gameID: number, userID: string) {
	return await prisma.requestToJoin.findUnique({
		where: {
			requestToPlayer: { gameID, playerID: userID }
		},
        include: { game: true, player: { include: { ratings: true } } }
	});
}

export async function getRequestToJoinByID(id: number) {
	return await prisma.requestToJoin.findUnique({
		where: {
			id
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
	return await prisma.game.findMany({
		take: limit,
		orderBy: { createdOn: 'desc' },
		include: { players: true }
	});
}

export async function getOpenGameRequestForAdmin(organiserID: string) {
	return await prisma.requestToJoin.findMany({
		where: {
			accepted: null,
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

export type GameWithRelatedFields = Prisma.GameGetPayload<{
	include: {
		players: true;
		location: {
			include: {
				coordinates: true;
			};
		};
	};
}>;

export async function getGamesWithMatchingIDs(gameIDs: number[]): Promise<GameWithRelatedFields[]> {
	return await prisma.game.findMany({
		where: {
			id: { in: gameIDs }
		},
		include: {
			players: true,
			location: {
				include: {
					coordinates: true
				}
			}
		}
	});
}

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

export async function updateRequestToJoin(requestID: number, accepted: boolean) {
	await prisma.requestToJoin.update({
		where: { id: requestID },
		data: {
			accepted
		}
	});
}

export async function deleteRequestToJoin(gameID: number, playerID: string) {
    await prisma.requestToJoin.delete({
        where: {
            requestToPlayer: {
                playerID, gameID
            }
        }
    })
}

export async function getOpenRequestsForGame(gameID: number) {
    return await prisma.requestToJoin.findMany({
        where: {
            gameID: gameID,
            accepted: null
        },
        include: { game: true, player: { include: { ratings: true } } }
    });
}