import { Prisma, type Address } from '@prisma/client';
import prisma from './prisma';
import type { SuperValidated } from 'sveltekit-superforms';
import { addressSchema } from '$lib/validation/auth';
import type z from 'zod/v4';
import { encrypt } from './encryption';

type addressData = z.infer<typeof addressSchema>;

/**
 * Create a new coordinates object in the database using a raw query
 * as currently postgids is not supported in prisma
 * @param longitude the longitude of the coordinate
 * @param latitude the latitude of the coordinates
 * @returns the id of the new coordinates
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
 * @returns the coordiantes object
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
 * Function that either creates a new address, which is encryped, or if there is a previous addrees, it updates the address with
 * the new coordinates, then deletes the old cordinates
 * @param form The submitted supervalidated form
 * @returns
 */
export async function createAddressFromForm(form: SuperValidated<addressData>) {
	let newAddress: Address;
	let { lineOne, lineTwo, city, county, country, eircode, addressID, latitude, longitude } =
		form.data;

	const coordinatesID = await createCoordinates(longitude, latitude);
	let previousCoordiantesID: number | undefined = undefined;

	/*if a previous address was created, get a reference to the old coordinates 
    and delete it after the new coordinates has been linked
    */
	if (addressID) {
		const address = await prisma.address.findFirst({ where: { id: addressID } });
		if (address) {
			previousCoordiantesID = address.coordinatesID;
		}

		newAddress = await prisma.address.update({
			where: { id: addressID },
			data: {
				lineOne: encrypt(lineOne),
				lineTwo: encrypt(lineTwo),
				city: encrypt(city),
				county: encrypt(county),
				country: encrypt(country),
				eircode: encrypt(eircode),
				coordinates: { connect: { id: coordinatesID } }
			}
		});

		if (previousCoordiantesID) {
			await prisma.coordinates.delete({ where: { id: previousCoordiantesID } });
		}
	} else {
		newAddress = await prisma.address.create({
			data: {
				lineOne: encrypt(lineOne),
				lineTwo: encrypt(lineTwo),
				city: encrypt(city),
				county: encrypt(county),
				country: encrypt(country),
				eircode: encrypt(eircode),
				coordinates: { connect: { id: coordinatesID } }
			}
		});
	}

	return newAddress.id;
}

export async function getAddressByID(id: number) {
	const address = await prisma.address.findUnique({
		where: { id }
	});
	if (!address) {
		throw new Error(`Address with an id: ${id} not found`);
	}
	return address;
}
