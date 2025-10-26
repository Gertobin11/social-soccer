import { createCoordinates, getCoordinateByID } from '$lib/server/address';
import prisma from '$lib/server/prisma';
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
		await expect(getCoordinateByID(0)).rejects.toThrowError("No result returned from database query");
	});
});
