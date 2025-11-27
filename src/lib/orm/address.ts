import { Prisma, type Address } from '@prisma/client';
import prisma from '../server/prisma';
import { encrypt } from '$lib/server/encryption';

/**
 * Create a new coordinates object in the database using a raw query
 * as currently postgids is not supported in prisma
 * @param longitude the longitude of the coordinate
 * @param latitude the latitude of the coordinates
 * @returns number
 */
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

/**
 *
 * Function that gets a coordinate by its ID
 * @param id the id of the coordinates
 * @returns Coordinates
 */
export async function getCoordinateByID(id: number): Promise<CoordinateWithGeoJSON> {
	const sql = Prisma.sql`
    SELECT
      id,
      ST_AsGeoJSON(location) as location
    FROM "Coordinates"
    WHERE id = ${id};
  `;

	const result = await prisma.$queryRaw<DatabaseCoordinateResult[]>(sql);

	if (!result || result.length < 1) {
		throw new Error('No result returned from database query');
	}

	const rawData = result[0];

	const location = JSON.parse(rawData.location) as GeoJSONPoint;

	return {
		id: rawData.id,
		location
	};
}

/**
 * Function that looks up the closest games coordinates based off the passed
 * in longitude and latitude
 * @param longitude the longitude of the point where the distance is calculated from
 * @param latitude the latitude of the point where the distance is calculated from
 * @param amount the number of records retrieved
 * @returns DatabaseCoordinateResultWithDistance[]
 */
export async function findNearestGames(longitude: number, latitude: number, amount: number) {
	const sql = Prisma.sql`
    SELECT 
      g.id,
      ST_AsGeoJSON(c.location) as location,
      ST_Distance(
        c.location, 
        ST_SetSRID(ST_MakePoint(${latitude}, ${longitude}), 4326)::geography
      ) as distance
    FROM "Game" g
    JOIN "Address" a ON g."locationID" = a.id
    JOIN "Coordinates" c ON a."coordinatesID" = c.id
    WHERE g.active = 't'
    ORDER BY 
      c.location <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
    LIMIT ${amount};
  `;

	const results = await prisma.$queryRaw<DatabaseCoordinateResultWithDistance[]>(sql);

    return results.map((result) => {
        return {
            distance: result.distance,
            id: result.id,
            location: result.location
        }
    })
}


/**
 * Function that uses prisma to create an address
 * @param data AddressData
 * @param coordinatesID id on a coordinates object to link to the addres
 * @returns Address
 */
export async function createAddress(data: AddressFields, coordinatesID: any) {
	return await prisma.address.create({
		data: {
			lineOne: encrypt(data.lineOne),
			lineTwo: encrypt(data.lineTwo),
			city: encrypt(data.city),
			county: encrypt(data.county),
			country: encrypt(data.country),
			eircode: encrypt(data.eircode),
			coordinates: { connect: { id: coordinatesID } }
		}
	});
}

/**
 * Function that returns the address of the id passed, or throws an error if it is not found
 * @param id the id of the address
 * @returns Address
 */
export async function getAddressByID(id: number) {
	const address = await prisma.address.findUnique({
		where: { id }
	});
	if (!address) {
		throw new Error(`Address with an id: ${id} not found`);
	}
	return address;
}

/**
 * Function that uses prisma to update an address in the database
 * @param data The fields in the address form
 * @param coordinatesID the id from the coordinates to link with the address
 * @returns Address
 */
export async function updateAddress(data: AddressFields, coordinatesID: number) {
	return await prisma.address.update({
		where: { id: data.addressID },
		data: {
			lineOne: encrypt(data.lineOne),
			lineTwo: encrypt(data.lineTwo),
			city: encrypt(data.city),
			county: encrypt(data.county),
			country: encrypt(data.country),
			eircode: encrypt(data.eircode),
			coordinates: { connect: { id: coordinatesID } }
		}
	});
}

export async function findFirstMatchingAddress(id: number) {
	return await prisma.address.findFirst({ where: { id } });
}

export async function deleteCoordinatesByID(previousCoordiantesID: number) {
	await prisma.coordinates.delete({ where: { id: previousCoordiantesID } });
}
