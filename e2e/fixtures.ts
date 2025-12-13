import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';

export async function createCoordinates(longitude: number, latitude: number): Promise<number> {
	// using Prisma.sql to protect against sql injection
	const sql = Prisma.sql`
        INSERT INTO "Coordinates" (location)
        VALUES (
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        )
        RETURNING id;
    `;

	const result = await prisma.$queryRaw<{ id: number }[]>(sql);

	// this will always be present, if not the database will have thrown an error
	const newCoordinateId = result[0]!.id;

	return newCoordinateId;
}

dotenv.config();

import Cryptr from 'cryptr';
import { env } from 'process';

if (!env.ENCRYPTION_KEY) {
	throw new Error('ENCRYPTION_KEY not set in test environment');
}

const cryptr = new Cryptr(env.ENCRYPTION_KEY);

export const prisma: PrismaClient = new PrismaClient({
	datasources: {
		db: {
			url: process.env.TESTING_DATABASE_URL
		}
	}
});

export const withBasicUser = async (page: any) => {
	if (process.env.DEPLOYMENT_ENV !== 'testing') {
		throw new Error(
			`Error: Deployment env not set to 'testing', deployment value is: '${process.env.DEPLOYMENT_ENV}'`
		);
	}

	if (!process.env.ETHEREAL_EMAIL || !process.env.EMAIL_PASSWORD) {
		throw new Error('ETHEREAL_EMAIL or EMAIL_PASSWORD env var not set for integration test');
	}

	const hashedPassword = await hash(process.env.EMAIL_PASSWORD);

	return await prisma.user.create({
		data: {
			id: 'fake random string',
			email: process.env.ETHEREAL_EMAIL,
			emailVerified: true,
			passwordHash: hashedPassword
		}
	});
};

const locations = [
	{
		latitude: 52.2713,
		longitude: -9.7026,
		lineOne: 'No. 1',
		lineTwo: 'Main Street',
		city: 'Tralee',
		county: 'Kerry',
		country: 'IE',
		eircode: 'V92 ADC4'
	},
	{
		latitude: 52.0599,
		longitude: -9.5044,
		lineOne: 'No. 2',
		lineTwo: 'Main Street',
		city: 'Killarney',
		county: 'Kerry',
		country: 'IE',
		eircode: 'V93 WX21'
	},
	{
		latitude: 52.1409,
		longitude: -10.2703,
		lineOne: 'No. 3',
		lineTwo: 'Main Street',
		city: 'Dingle',
		county: 'Kerry',
		country: 'IE',
		eircode: 'V92 GH56'
	},
	{
		latitude: 51.9995,
		longitude: -9.7427,
		lineOne: 'No. 4',
		lineTwo: 'Main Street',
		city: 'Killarney',
		county: 'Kerry',
		country: 'IE',
		eircode: 'V93 YZ89'
	},
	{
		latitude: 52.4474,
		longitude: -9.4855,
		lineOne: 'No. 5',
		lineTwo: 'Main Street',
		city: 'Listowel',
		county: 'Kerry',
		country: 'IE',
		eircode: 'V31 AB12'
	}
];

export async function withGames() {
	const user = await prisma.user.findFirst();
	if (!user) {
		throw new Error('No user found, check if the user fixture was called first');
	}
	for (let location of locations) {
		const coordinates = await createCoordinates(location.longitude, location.latitude);

		let address = await prisma.address.create({
			data: {
				lineOne: cryptr.encrypt(location.lineOne),
				lineTwo: cryptr.encrypt(location.lineTwo),
				city: cryptr.encrypt(location.city),
				county: cryptr.encrypt(location.county),
				country: cryptr.encrypt(location.country),
				eircode: cryptr.encrypt(location.eircode),
				coordinates: { connect: { id: coordinates } }
			}
		});
		await prisma.game.create({
			data: {
				locationID: address.id,
				level: 'BEGINNER',
				numberOfPlayers: 10,
				active: true,
				organiserID: user.id,
				time: '20:00',
				day: 'Monday'
			}
		});
	}
}
