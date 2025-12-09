import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { withAdditionalUser, withAddress, withUser } from '../../fixtures';
import prisma from '$lib/server/prisma';
import {
	addPlayerToGame,
	createGame,
	createRequestToJoin,
	deleteRequestToJoin,
	getGameByID,
	getGamesParticipatingIn,
	getGamesWithMatchingIDs,
	getLatestGames,
	getManagedGames,
	getOpenGameRequestForAdmin,
	getOpenRequestsForGame,
	getRequestToJoin,
	getRequestToJoinByID,
	removePlayerFromGame,
	updateRequestToJoin
} from '$lib/orm/game';
import { Level } from '@prisma/client';

async function cleanUp() {
	await prisma.requestToJoin.deleteMany();
	await prisma.coordinates.deleteMany({});
	await prisma.address.deleteMany();
	await prisma.user.deleteMany();
	await prisma.game.deleteMany();
}

describe('createGame', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should create a game with the passed parameters', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const result = await createGame(
			'Monday',
			true,
			'19.00',
			10,
			user.id,
			Level.ADVANCED,
			address.id
		);

		expect(result.active).toBe(true);
		expect(result.day).toBe('Monday');
		expect(result.level).toBe(Level.ADVANCED);
		expect(result.locationID).toBe(address.id);
		expect(result.numberOfPlayers).toBe(10);
		expect(result.organiserID).toBe(user.id);
		expect(result.time).toBe('19.00');
	});
});

describe('getGameByID', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should return the game with the matching ID', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

		const result = await getGameByID(game.id);

		expect(result).toStrictEqual(game);
	});
	it('should return null if no matching game is found', async () => {
		const result = await getGameByID(-1);

		expect(result).toBeNull();
	});
});

describe('createRequestToJoin', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should create a RequestToJoin record with the passed params', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

		const result = await createRequestToJoin(game.id, user.id);

		expect(result.gameID).toBe(game.id);
		expect(result.playerID).toBe(user.id);
		expect(result.accepted).toBeNull();
	});
});

describe('getRequestToJoin', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should create a RequestToJoin record with the passed params', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

		const requestToJoin = await createRequestToJoin(game.id, user.id);

		const result = await getRequestToJoin(game.id, user.id);

		if (!result) {
			throw new Error('No result returned');
		}

		expect(result.id).toBe(requestToJoin.id);
	});

	it('should return null if no matching request is found', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

		const result = await getRequestToJoin(game.id, user.id);

		expect(result).toBeNull();
	});
});

describe('getRequestToJoinByID', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should create a RequestToJoin record with the passed ID', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

		const requestToJoin = await createRequestToJoin(game.id, user.id);

		const result = await getRequestToJoinByID(requestToJoin.id);

		if (!result) {
			throw new Error('No result returned');
		}

		expect(result.id).toBe(requestToJoin.id);
	});

	it('should return null if no matching request is found', async () => {
		const result = await getRequestToJoinByID(-1);

		expect(result).toBeNull();
	});
});

describe('addPlayerToGame', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should add a player to a game', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);
		const newUser = await withAdditionalUser('test2@gmail.com');

		const result = await addPlayerToGame(game.id, newUser.id);

		expect(result.players.find((player) => player.email === newUser.email)).toStrictEqual(newUser);
	});
});

describe('getLatestGames', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should return the two latest games', async () => {
		const { gameThree, gameTwo } = await withThreeGames();
		const result = await getLatestGames(2);

		expect(result[0]).toStrictEqual(gameThree);
		expect(result[1]).toStrictEqual(gameTwo);
	});
});

describe('getOpenGameRequestForAdmin', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should return all the requestToJoin records with accepted as null', async () => {
		const user = await withUser();
		const userTwo = await withAdditionalUser('test2@gmail.com');
		const userThree = await withAdditionalUser('test3@gmail.com');
		const userFour = await withAdditionalUser('test4@gmail.com');
		const userFive = await withAdditionalUser('test5@gmail.com');

		let longitude = 52.2675;
		let latitude = 9.6962;
		let addressOne = await withAddress(longitude, latitude, 0);
		let addressTwo = await withAddress(longitude + 1, latitude, 0);
		let addressThree = await withAddress(longitude + 2, latitude, 0);

		const gameOne = await createGame(
			'Monday',
			true,
			'19.00',
			10,
			user.id,
			Level.ADVANCED,
			addressOne.id
		);
		const gameTwo = await createGame(
			'Tuesday',
			true,
			'20.00',
			8,
			user.id,
			Level.BEGINNER,
			addressTwo.id
		);
		const gameThree = await createGame(
			'Thursday',
			true,
			'16.00',
			12,
			user.id,
			Level.COMPETITIVE,
			addressThree.id
		);

		let request = await createRequestToJoin(gameOne.id, userTwo.id);

		await prisma.requestToJoin.update({
			where: {
				id: request.id
			},
			data: {
				accepted: false
			}
		});
		await createRequestToJoin(gameOne.id, userThree.id);
		await createRequestToJoin(gameOne.id, userFour.id);

		request = await createRequestToJoin(gameTwo.id, userTwo.id);

		await prisma.requestToJoin.update({
			where: {
				id: request.id
			},
			data: {
				accepted: true
			}
		});
		await createRequestToJoin(gameTwo.id, userThree.id);
		await createRequestToJoin(gameTwo.id, userFive.id);

		request = await createRequestToJoin(gameThree.id, userThree.id);

		await prisma.requestToJoin.update({
			where: {
				id: request.id
			},
			data: {
				accepted: true
			}
		});
		await createRequestToJoin(gameThree.id, userFour.id);
		await createRequestToJoin(gameThree.id, userFive.id);

		const results = await getOpenGameRequestForAdmin(user.id);

		expect(results.length).toBe(6);

		for (let result of results) {
			expect(result.accepted).toBeNull();
		}
	});
});

describe('getManagedGames', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should return the 3 managed games', async () => {
		let { user, gameOne, gameTwo, gameThree } = await withThreeGames();

		const result = await getManagedGames(user.id);

		expect(result.length).toBe(3);

		expect(result).toStrictEqual([gameOne, gameTwo, gameThree]);
	});
});

describe('getGamesParticipatingIn', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should return all the games a user is participating in', async () => {
		const user = await withUser();
		const userTwo = await withAdditionalUser('test2@gmail.com');
		let longitude = 52.2675;
		let latitude = 9.6962;
		let addressOne = await withAddress(longitude, latitude, 0);
		let addressTwo = await withAddress(longitude + 1, latitude, 0);
		let addressThree = await withAddress(longitude + 2, latitude, 0);

		const gameOne = await createGame(
			'Monday',
			true,
			'19.00',
			10,
			userTwo.id,
			Level.ADVANCED,
			addressOne.id
		);
		let gameTwo = await createGame(
			'Tuesday',
			true,
			'20.00',
			8,
			user.id,
			Level.BEGINNER,
			addressTwo.id
		);
		let gameThree = await createGame(
			'Thursday',
			true,
			'16.00',
			12,
			user.id,
			Level.COMPETITIVE,
			addressThree.id
		);

		await addPlayerToGame(gameTwo.id, userTwo.id);
		await addPlayerToGame(gameThree.id, userTwo.id);

		let gameQuery = await getGameByID(gameTwo.id);

		if (gameQuery) {
			gameTwo = gameQuery;
		}

		gameQuery = await getGameByID(gameThree.id);

		if (gameQuery) {
			gameThree = gameQuery;
		}

		const result = await getGamesParticipatingIn(userTwo.id);

		expect(result.length).toBe(2);

		expect(result).toStrictEqual([gameTwo, gameThree]);
	});
});

describe('getGamesWithMatchingIDs', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should return an array of Game objects that match an id of the passed array', async () => {
		let { gameTwo, gameThree } = await withThreeGames();

		const result = await getGamesWithMatchingIDs([gameTwo.id, gameThree.id]);
		expect(result).toStrictEqual([gameTwo, gameThree]);
	});
});

describe('removePlayerFromGame', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});

	it('should remove the player with the passed ID from the game', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let addressOne = await withAddress(longitude, latitude, 0);
		const game = await createGame(
			'Monday',
			true,
			'19.00',
			10,
			user.id,
			Level.ADVANCED,
			addressOne.id
		);

		expect(game.players.length).toBe(1);

		await removePlayerFromGame(game.id, user.id);

		const result = await prisma.game.findUniqueOrThrow({
			where: {
				id: game.id
			},
			include: { players: true }
		});

		expect(result.players.length).toBe(0);
	});
});

async function withThreeGames() {
	const user = await withUser();
	let longitude = 52.2675;
	let latitude = 9.6962;
	let addressOne = await withAddress(longitude, latitude, 0);
	let addressTwo = await withAddress(longitude + 1, latitude, 0);
	let addressThree = await withAddress(longitude + 2, latitude, 0);

	const gameOne = await createGame(
		'Monday',
		true,
		'19.00',
		10,
		user.id,
		Level.ADVANCED,
		addressOne.id
	);
	const gameTwo = await createGame(
		'Tuesday',
		true,
		'20.00',
		8,
		user.id,
		Level.BEGINNER,
		addressTwo.id
	);
	const gameThree = await createGame(
		'Thursday',
		true,
		'16.00',
		12,
		user.id,
		Level.COMPETITIVE,
		addressThree.id
	);
	return { user, gameOne, gameTwo, gameThree };
}

describe('updateRequestToJoin', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should update the request to true', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

		const requestToJoin = await createRequestToJoin(game.id, user.id);

		const result = await updateRequestToJoin(requestToJoin.id, true);

		expect(result.accepted).toBe(true);
	});
});

describe('deleteRequestToJoin', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should delete the request', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

		const requestToJoin = await createRequestToJoin(game.id, user.id);

		await deleteRequestToJoin(game.id, user.id);

		const result = await prisma.requestToJoin.findUnique({
			where: {
				id: requestToJoin.id
			}
		});

		expect(result).toBeNull();
	});
});

describe('getOpenRequestsForGame', () => {
	beforeEach(async () => {
		await cleanUp();
	});

	afterEach(async () => {
		await cleanUp();
	});
	it('should return the request that do not have a value set on accepted', async () => {
		const user = await withUser();
		const userTwo = await withAdditionalUser('test2@gmail.com');
		const userThree = await withAdditionalUser('test3@gmail.com');
		const userFour = await withAdditionalUser('test4@gmail.com');
		const userFive = await withAdditionalUser('test5@gmail.com');

		let longitude = 52.2675;
		let latitude = 9.6962;
		let addressOne = await withAddress(longitude, latitude, 0);

		const gameOne = await createGame(
			'Monday',
			true,
			'19.00',
			10,
			user.id,
			Level.ADVANCED,
			addressOne.id
		);

		let request = await createRequestToJoin(gameOne.id, userTwo.id);

		await prisma.requestToJoin.update({
			where: {
				id: request.id
			},
			data: {
				accepted: false
			}
		});
		await createRequestToJoin(gameOne.id, userThree.id);
		await createRequestToJoin(gameOne.id, userFour.id);

		request = await createRequestToJoin(gameOne.id, user.id);

		await prisma.requestToJoin.update({
			where: {
				id: request.id
			},
			data: {
				accepted: true
			}
		});
		await createRequestToJoin(gameOne.id, userFive.id);

		const result = await getOpenRequestsForGame(gameOne.id);
		expect(result.length).toBe(3);

		for (let request of result) {
			expect(request.accepted).toBeNull();
		}
	});
});
