import type { createGameSchema } from '$lib/validation/game';
import type { SuperValidated } from 'sveltekit-superforms';

import type z from 'zod/v4';
import prisma from './prisma';
import type { Game, Level } from '@prisma/client';
import { getAddressByID, getCoordinateByID } from './address';
import { decrypt } from './encryption';

type createGameData = z.infer<typeof createGameSchema>;

/**
 * Function that takes in a super validated form and an oraniser id, to create a game and link it with
 * the location in the form
 * @param form The submitted supervalidated form
 * @param organiserID The users id who created the game
 * @returns
 */
export async function createGameFromForm(
	form: SuperValidated<createGameData>,
	organiserID: string
) {
	let { day, active, time, numberOfPlayers, level, addressID } = form.data;

	await prisma.game.create({
		data: {
			day,
			active,
			time,
			numberOfPlayers,
			organiserID,
			level,
			locationID: addressID,
            players: {connect: {id: organiserID}}
		},
	});
}

export async function getLatestGames(limit: number) {
	return await prisma.game.findMany({ take: limit, orderBy: { createdOn: 'desc' } });
}

// used for showing games in Google Maps API
export type GameData = {
	id: number;
	coordinates: CoordinateWithGeoJSON;
	day: string;
	time: string;
	level: Level;
	lineOne: string;
	lineTwo: string;
	city: string;
	county: string;
	country: string;
	eircode: string;
};

export async function buildGameDataForMap(game: Game): Promise<GameData> {
	const address = await getAddressByID(game.locationID);
	const gameData: GameData = {
		id: game.id,
		level: game.level,
		day: game.day,
		time: game.time,
		coordinates: await getCoordinateByID(address.coordinatesID),
		lineOne: decrypt(address.lineOne),
		lineTwo: decrypt(address.lineTwo),
		city: decrypt(address.city),
		county: decrypt(address.county),
		country: decrypt(address.country),
		eircode: decrypt(address.eircode)
	};

	return gameData;
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

export async function createRequestToJoin(gameID: number, userID: string) {
    await prisma.requestToJoin.create({
        data: {
            gameID,
            playerID: userID
        }
    });
}

export async function verifyRequestToJoinIsUnique(gameID: number, userID: string) {
    const previousRequest = await prisma.requestToJoin.findUnique({
        where: {
            requestToPlayer: { gameID, playerID: userID }
        }
    });

    if (previousRequest) {
        throw new Error("User already has a request to join this game");
    }
}

export async function getGameWithPLayers(gameID: number) {
    const game = await prisma.game.findUnique({
        where: {
            id: gameID
        },
        include: {
            players: true
        }
    });

    if (!game) {
        throw new Error(`Unable to find game with an id of: ${gameID}`);
    }
    return game;
}