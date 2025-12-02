import type { createGameSchema } from '$lib/validation/game';
import type { SuperValidated } from 'sveltekit-superforms';

import type z from 'zod/v4';
import type { Level, Prisma } from '@prisma/client';
import {
	createGame,
	getGameByID,
	getGamesWithMatchingIDs,
	getRequestToJoin,
	type GameWithRelatedFields
} from '$lib/orm/game';
import { getAddressByID, getCoordinateByID } from '$lib/orm/address';

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

	await createGame(day, active, time, numberOfPlayers, organiserID, level, addressID);
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

export type MapGameData = {
	id: number;
	coordinates: CoordinateWithGeoJSON;
	day: string;
	time: string;
	level: Level;
	numberOfPlayers: number;
	currentPlayerNumbers: number;
};

type GameWithPlayers = Prisma.GameGetPayload<{ include: { players: true } }>;

export async function buildGameDataForMap(game: GameWithPlayers): Promise<MapGameData> {
	const address = await getAddressByID(game.locationID);
	const gameData: MapGameData = {
		id: game.id,
		level: game.level,
		day: game.day,
		time: game.time,
		coordinates: await getCoordinateByID(address.coordinatesID),
		numberOfPlayers: game.numberOfPlayers,
		currentPlayerNumbers: game.players.length
	};

	return gameData;
}

export async function verifyRequestToJoinIsUnique(gameID: number, userID: string) {
	const previousRequest = await getRequestToJoin(gameID, userID);

	if (previousRequest) {
		throw new Error('User already has a request to join this game');
	}
}

export async function getGameWithPlayers(gameID: number) {
	const game = await getGameByID(gameID);

	if (!game) {
		throw new Error(`Unable to find game with an id of: ${gameID}`);
	}
	return game;
}

export type GameWithGeoData = GameWithRelatedFields & {
	distance: number;
	currentPlayerNumbers: number;
	geoLocation: GeoJSONPoint;
};

export async function buildClosestGameData(
	databaseResults: DatabaseCoordinateResultWithDistance[]
): Promise<GameWithGeoData[]> {
	const closestGameData: GameWithGeoData[] = [];
	const gameIDs = databaseResults.map((result) => result.id);

	if (gameIDs.length > 0) {
		const mattchedGames = await getGamesWithMatchingIDs(gameIDs);

		mattchedGames.forEach((game) => {
			let matchedData = databaseResults.find((result) => result.id === game.id);
			if (matchedData) {
				const geoLocation = JSON.parse(matchedData.location) as GeoJSONPoint;
				closestGameData.push({
					...game,
					distance: matchedData.distance,
					currentPlayerNumbers: game.players.length,
					geoLocation
				});
			}
		});
	}

	return closestGameData;
}

export async function verifyUserIsOrganiserOfGame(gameID: number, userID: string) {
	const game = await getGameByID(gameID);

	if (!game) {
		throw new Error(`Game with id: ${gameID} does not exist`);
	}

	if (game.organiserID !== userID) {
		throw new Error(`User with id ${userID} is not the organiser of game with id ${gameID}`);
	}
}
