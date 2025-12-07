import {
	createAddress,
	createCoordinates,
	deleteCoordinatesByID,
	findNearestGames,
	getAddress,
	getAddressByID,
	getCoordinateByID,
	updateAddress
} from '$lib/orm/address';
import { createGame } from '$lib/orm/game';
import { createUser } from '$lib/orm/user';
import { decrypt } from '$lib/server/encryption';
import prisma from '$lib/server/prisma';
import { hash } from '@node-rs/argon2';
import { Level } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('createCoordinates', () => {
	beforeEach(async () => {
		await prisma.coordinates.deleteMany({});
	});

	afterEach(async () => {
		await prisma.coordinates.deleteMany({});
	});

	it('should create a new coordinate and return the coordinate id', async () => {
		const longitude = 52.2675;
		const latitude = 9.6962;

		const result = await createCoordinates(longitude, latitude);
		expect(result).not.toBeNull();

		const coordinates = await getCoordinateByID(result);

		expect(coordinates.id).toStrictEqual(result);

		expect(coordinates.location.coordinates[0]).toBe(longitude);
		expect(coordinates.location.coordinates[1]).toBe(latitude);
		expect(coordinates.location.type).toBe('Point');
	});

	it('should throw an error if an incorrect longitude is passed', async () => {
		const longitude = null as any;
		const latitude = null as any;

		await expect(createCoordinates(longitude, latitude)).rejects.toThrowError();
	});
});

describe('getCoordinateByID', () => {
	beforeEach(async () => {
		await prisma.coordinates.deleteMany({});
	});

	afterEach(async () => {
		await prisma.coordinates.deleteMany({});
	});

	it('should return the coordinates object with the corresponding id', async () => {
		const longitude = 52.2675;
		const latitude = 9.6962;

		const id = await createCoordinates(longitude, latitude);

		const result = await getCoordinateByID(id);

		expect(result.id).toStrictEqual(id);

		expect(result.location.coordinates[0]).toBe(longitude);
		expect(result.location.coordinates[1]).toBe(latitude);
		expect(result.location.type).toBe('Point');
	});

	it('should throw an error if there is no matching coordinates from the id', async () => {
		await expect(getCoordinateByID(0)).rejects.toThrowError(
			'No result returned from database query'
		);
	});
});

describe('findNearestGames', () => {
	beforeEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
		await prisma.user.deleteMany();
		await prisma.game.deleteMany();
	});

	afterEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
		await prisma.user.deleteMany();
		await prisma.game.deleteMany();
	});
	it('should return an array of games closest to the longitude latitude passed in', async () => {
		const passwordHash = await hash('test password', {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		const user = await createUser('abcderasa', 'test@gmail.com', passwordHash);
		let longitude = 52.2675;
		let latitude = 9.6962;
		let nearest: number[] = [];
		for (let i = 0; i < 10; i++) {
			// each loop, move the long and latitude further away
			let address = await withAddress(longitude, latitude, i);
			let game = await createGame('Monday', true, '20:00', 10, user.id, Level.ADVANCED, address.id);

			//add the nearest 5  games to the array
			if (i < 5) {
				nearest.push(game.id);
			}
		}

		const results = await findNearestGames(longitude, latitude, 5);

		expect(results.length).toBe(nearest.length);

		for (let result of results) {
			expect(nearest).contains(result.id);
		}

		// should be 0 as it is the same location
		expect(results[0].distance).toBe(0);
		expect(JSON.parse(results[0].location).coordinates[0]).toBe(longitude);
		expect(JSON.parse(results[0].location).coordinates[1]).toBe(latitude);

		// should be the distance in meters
		expect(results[1].distance).toBe(155692.85249475);
		expect(JSON.parse(results[1].location).coordinates[0]).toBe(longitude + 1);
		expect(JSON.parse(results[1].location).coordinates[1]).toBe(latitude + 1);
	});
});

describe('createAddress', () => {
	beforeEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
		await prisma.user.deleteMany();
		await prisma.game.deleteMany();
	});

	afterEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
		await prisma.user.deleteMany();
		await prisma.game.deleteMany();
	});
	it('should create an encryted address object', async () => {
		let longitude = 52.2675;
		let latitude = 9.6962;
		const coordinates = await createCoordinates(longitude, latitude);
		let addressData: AddressFields = {
			lineOne: `No. 1`,
			lineTwo: 'Main Street',
			city: 'Tralee',
			county: 'Kerry',
			country: 'IE',
			eircode: 'v92adc4'
		};
		let result = await createAddress(addressData, coordinates);

		expect(decrypt(result.lineOne)).toBe(addressData.lineOne);
		expect(decrypt(result.lineTwo)).toBe(addressData.lineTwo);
		expect(decrypt(result.city)).toBe(addressData.city);
		expect(decrypt(result.county)).toBe(addressData.county);
		expect(decrypt(result.country)).toBe(addressData.country);
		expect(decrypt(result.eircode)).toBe(addressData.eircode);
		expect(result.coordinatesID).toBe(coordinates);
	});
});

describe('getAddressByID', () => {
    beforeEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
	});

	afterEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
	});
	it('should return the Address that matches the passed in id', async () => {
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 1);

		const result = await getAddressByID(address.id);
		expect(result.lineOne).toBe(address.lineOne);
		expect(result.lineTwo).toBe(address.lineTwo);
		expect(result.city).toBe(address.city);
		expect(result.county).toBe(address.county);
		expect(result.country).toBe(address.country);
		expect(result.eircode).toBe(address.eircode);
	});

	it('should throw an error if an address is not found', async () => {
		await expect(() => getAddressByID(-1)).rejects.toThrowError('Address with an id: -1 not found');
	});
});

describe('updateAddress', () => {
	beforeEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
	});

	afterEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
	});
	it('should update an address object with new encrypted data', async () => {
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 1);

		let updatedAddressData: AddressFields = {
			addressID: address.id,
			lineOne: `No. 45`,
			lineTwo: 'Denny Street',
			city: 'Tralee',
			county: 'Kerry',
			country: 'IE',
			eircode: 'v92ad54'
		};

		let newCoordinates = await createCoordinates(longitude + 1, latitude + 1);

		const result = await updateAddress(updatedAddressData, newCoordinates);

		expect(decrypt(result.lineOne)).toBe(updatedAddressData.lineOne);
		expect(decrypt(result.lineTwo)).toBe(updatedAddressData.lineTwo);
		expect(decrypt(result.city)).toBe(updatedAddressData.city);
		expect(decrypt(result.county)).toBe(updatedAddressData.county);
		expect(decrypt(result.country)).toBe(updatedAddressData.country);
		expect(decrypt(result.eircode)).toBe(updatedAddressData.eircode);
		expect(result.coordinatesID).toBe(newCoordinates);
	});
});

describe('getAddress', () => {
    beforeEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
	});

	afterEach(async () => {
		await prisma.coordinates.deleteMany({});
		await prisma.address.deleteMany();
	});
	it('should return the Address that matches the passed in id', async () => {
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 1);

		const result = await getAddress(address.id);

		if (!result) {
			throw new Error('No Address found');
		}
		expect(result.lineOne).toBe(address.lineOne);
		expect(result.lineTwo).toBe(address.lineTwo);
		expect(result.city).toBe(address.city);
		expect(result.county).toBe(address.county);
		expect(result.country).toBe(address.country);
		expect(result.eircode).toBe(address.eircode);
	});

	it('should return null if no address is found', async () => {
		const result = await getAddress(-1);
		expect(result).toBeNull();
	});
});

describe('deleteCoordinatesByID', () => {
	it('should delete the corresponding coordinates from the passed id', async () => {
		let longitude = 52.2675;
		let latitude = 9.6962;
		let address = await withAddress(longitude, latitude, 1);

		await deleteCoordinatesByID(address.coordinatesID);

		await expect(getCoordinateByID(address.coordinatesID)).rejects.toThrowError(
			'No result returned from database query'
		);
	});
});

async function withAddress(longitude: number, latitude: number, i: number) {
	const coordinates = await createCoordinates(longitude + i, latitude + i);
	let addressData: AddressFields = {
		lineOne: `No. ${i}`,
		lineTwo: 'Main Street',
		city: 'Tralee',
		county: 'Kerry',
		country: 'IE',
		eircode: 'v92adc4'
	};
	let address = await createAddress(addressData, coordinates);
	return address;
}
