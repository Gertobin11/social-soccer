import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { withAddress, withUser } from '../../fixtures';
import {
	addAddressToUser,
	addNamesToUser,
	createRating,
	createUser,
	getRating,
	getUserByEmail,
	getUserByID,
    updateRating
} from '$lib/orm/user';
import prisma from '$lib/server/prisma';
import { decrypt } from '$lib/server/encryption';
import { hash } from '@node-rs/argon2';
import { createGame } from '$lib/orm/game';
import { Level } from '@prisma/client';
import { Rating } from '@skeletonlabs/skeleton-svelte';

describe('addNamesToUser', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should add an encrypted  first name and last name to a user', async () => {
		const user = await withUser();
		await addNamesToUser(user.id, 'Bob', 'Martin');
		const result = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			}
		});

		if (!result.firstName || !result.lastName) {
			throw new Error('Name details did not save correctly');
		}
		expect(decrypt(result.firstName)).toBe('Bob');
		expect(decrypt(result.lastName)).toBe('Martin');
	});
});

describe('createUser', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should add an encrypted  first name and last name to a user', async () => {
		const passwordHash = await hash('test password', {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		const result = await createUser('abcderasa', 'test@gmail.com', passwordHash);
		expect(result.email).toBe('test@gmail.com');
		expect(result.emailVerified).toBe(false);
		expect(result.passwordHash).toBe(passwordHash);
	});
});

describe('getUserByID', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should return the User object that has an ID that matched the passed ID', async () => {
		const user = await withUser();
		const result = await getUserByID(user.id);
		if (!result) {
			throw new Error('No user found');
		}
		expect(result.email).toBe('test@gmail.com');
		expect(result.emailVerified).toBe(false);
	});
	it('should return null if no user is found', async () => {
		const result = await getUserByID('-1');
		expect(result).toBeNull();
	});
});

describe('getUserByEmail', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should return the User object that has an email that matched the passed email', async () => {
		const user = await withUser();
		const result = await getUserByEmail(user.email);
		if (!result) {
			throw new Error('No user found');
		}
		expect(result.email).toBe('test@gmail.com');
		expect(result.emailVerified).toBe(false);
		expect(result.id).toBe(user.id);
	});
	it('should return null if no user is found', async () => {
		const result = await getUserByEmail('-1');
		expect(result).toBeNull();
	});
});

describe('addAddressToUser', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});
	it('should add an address to a user', async () => {
		const longitude = 52.2675;
		const latitude = 9.6962;
		const user = await withUser();
		const address = await withAddress(longitude, latitude, 0);

		const result = await addAddressToUser(user.id, address.id);

		expect(result.addressID).toBe(address.id);
	});
});

describe('createRating', () => {
    beforeEach(async () => {
        await prisma.rating.deleteMany()
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});

	afterEach(async () => {
        await prisma.rating.deleteMany()
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});
	it('should create a rating for a user in the game', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

        const result = await createRating(user.id, game.id, 7)

        expect(result.gameID).toBe(game.id)
        expect(result.playerID).toBe(user.id)
        expect(result.rating).toBe(7)
	});
});

describe('updateRating', () => {
    beforeEach(async () => {
        await prisma.rating.deleteMany()
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});

	afterEach(async () => {
        await prisma.rating.deleteMany()
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});
	it('should update a rating for a user in the game', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

        await createRating(user.id, game.id, 7)

        const result = await updateRating(user.id, game.id, 9)

        expect(result.gameID).toBe(game.id)
        expect(result.playerID).toBe(user.id)
        expect(result.rating).toBe(9)
	});
});

describe('getRating', () => {
    beforeEach(async () => {
        await prisma.rating.deleteMany()
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});

	afterEach(async () => {
        await prisma.rating.deleteMany()
		await prisma.user.deleteMany();
		await prisma.address.deleteMany();
	});
	it('should get the rating that maches the passed userID and gameID', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

        await createRating(user.id, game.id, 7)

        const result = await getRating(user.id, game.id)

        if(!result) {
            throw new Error("Rating not found")
        }

        expect(result.gameID).toBe(game.id)
        expect(result.playerID).toBe(user.id)
        expect(result.rating).toBe(7)
	});

    it('should return null if no rating is found', async () => {
		const user = await withUser();
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 0);

		const game = await createGame('Monday', true, '19.00', 10, user.id, Level.ADVANCED, address.id);

        const result = await getRating(user.id, game.id)

        expect(result).toBeNull()
	});
});