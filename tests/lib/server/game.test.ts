import { daysOfTheWeek } from '$lib/client/utils';
import {
	buildClosestGameData,
	buildGameDataForMap,
	createGameFromForm,
	getGameWithPlayers,
	verifyRequestToJoinIsUnique,
	verifyUserIsOrganiserOfGame,
	type GameWithPlayers
} from '$lib/server/game';
import { createGameSchema } from '$lib/validation/game';
import { Level } from '@prisma/client';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as gameORMModule from '$lib/orm/game';
import * as addressORMModule from '$lib/orm/address';

describe('createGameFromForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should call the createGame function with the form fields', async () => {
		const createGameMock = vi.fn();
		vi.spyOn(gameORMModule, 'createGame').mockImplementation(createGameMock);
		const gameData = {
			day: daysOfTheWeek[0],
			active: true,
			time: '19:00',
			numberOfPlayers: 8,
			level: Level.ADVANCED,
			addressID: 1
		};

		const form = await superValidate(gameData, zod4(createGameSchema));

		await createGameFromForm(form, 'test user id');

		expect(createGameMock).toHaveBeenCalledWith(
			'Monday',
			true,
			'19:00',
			8,
			'test user id',
			'ADVANCED',
			1
		);
	});
});

describe('buildGameDataForMap', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should return the data in the required format', async () => {
		const getCoordinateByIDMock = vi.fn().mockResolvedValue(44);
		const getAddressByIDMock = vi.fn().mockResolvedValue(33);
		vi.spyOn(addressORMModule, 'getCoordinateByID').mockImplementation(getCoordinateByIDMock);
		vi.spyOn(addressORMModule, 'getAddressByID').mockImplementation(getAddressByIDMock);

		const gameWithPlayers = {
			id: 23,
			level: Level.ADVANCED,
			day: daysOfTheWeek[1],
			time: '20:00',
			numberOfPlayers: 12,
			players: [1, 2, 3, 4]
		} as unknown as GameWithPlayers;

		const result = await buildGameDataForMap(gameWithPlayers);
		expect(result).toStrictEqual({
			coordinates: 44,
			currentPlayerNumbers: 4,
			day: 'Tuesday',
			id: 23,
			level: 'ADVANCED',
			numberOfPlayers: 12,
			time: '20:00'
		});
	});
});

describe('verifyRequestToJoinIsUnique', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should not throw  an error if no previous request was found', async () => {
		const getRequestToJoinMock = vi.fn().mockResolvedValue(false);
		vi.spyOn(gameORMModule, 'getRequestToJoin').mockImplementation(getRequestToJoinMock);
		await expect(verifyRequestToJoinIsUnique(12, 'test user id')).resolves.not.toThrowError();
	});

	it('should throw an error if a previous request was found', async () => {
		const getRequestToJoinMock = vi.fn().mockResolvedValue(true);
		vi.spyOn(gameORMModule, 'getRequestToJoin').mockImplementation(getRequestToJoinMock);
		await expect(verifyRequestToJoinIsUnique(12, 'test user id')).rejects.toThrowError(
			'User already has a request to join this game'
		);
	});
});

describe('getGameWithPlayers', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should not throw an error and return a what is returned from prisma', async () => {
		const getGameByIDMock = vi.fn().mockResolvedValue({ game: true });
		vi.spyOn(gameORMModule, 'getGameByID').mockImplementation(getGameByIDMock);

		const result = await getGameWithPlayers(1);

		expect(result).toStrictEqual({ game: true });
	});

	it('should throwan error if no player was found', async () => {
		const getGameByIDMock = vi.fn().mockResolvedValue(null);
		vi.spyOn(gameORMModule, 'getGameByID').mockImplementation(getGameByIDMock);

		await expect(getGameWithPlayers(1)).rejects.toThrowError(
			'Unable to find game with an id of: 1'
		);
	});
});

describe('buildClosestGameData', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it('should return the correct database structure', async () => {
		const getGamesWithMatchingIDsMock = vi.fn().mockResolvedValue([
			{ id: 1, players: [1, 2, 3] },
			{ id: 2, players: [1] }
		]);
		vi.spyOn(gameORMModule, 'getGamesWithMatchingIDs').mockImplementation(
			getGamesWithMatchingIDsMock
		);
		const databaseResults = [
			{ id: 1, location: JSON.stringify({ longitude: 100, latitude: 240 }), distance: 24 },
			{ id: 2, location: JSON.stringify({ longitude: 134, latitude: 111 }), distance: 32 }
		] as unknown as DatabaseCoordinateResultWithDistance[];
		const result = await buildClosestGameData(databaseResults);

		expect(result).toStrictEqual([
			{
				currentPlayerNumbers: 3,
				distance: 24,
				geoLocation: {
					latitude: 240,
					longitude: 100
				},
				id: 1,
				players: [1, 2, 3]
			},
			{
				currentPlayerNumbers: 1,
				distance: 32,
				geoLocation: {
					latitude: 111,
					longitude: 134
				},
				id: 2,
				players: [1]
			}
		]);
	});
});

describe('verifyUserIsOrganiserOfGame', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
	it("should not throw an error if the ID's match", async () => {
		const getGameByIDMock = vi.fn().mockResolvedValue({ organiserID: 'test-user' });

		vi.spyOn(gameORMModule, 'getGameByID').mockImplementation(getGameByIDMock);

		await expect(verifyUserIsOrganiserOfGame(48, 'test-user')).resolves.not.toThrowError();
	});

	it("should throw an error if the ID's do not match", async () => {
		const getGameByIDMock = vi.fn().mockResolvedValue({ organiserID: 'test-user-2' });

		vi.spyOn(gameORMModule, 'getGameByID').mockImplementation(getGameByIDMock);

		await expect(verifyUserIsOrganiserOfGame(48, 'test-user')).rejects.toThrowError(
			'User with id test-user is not the organiser of game with id 48'
		);
	});

    it("should throw an error if there is no game with the passed ID", async () => {
		const getGameByIDMock = vi.fn().mockResolvedValue(null);

		vi.spyOn(gameORMModule, 'getGameByID').mockImplementation(getGameByIDMock);

		await expect(verifyUserIsOrganiserOfGame(48, 'test-user')).rejects.toThrowError(
			'Game with id: 48 does not exist'
		);
	});
});
