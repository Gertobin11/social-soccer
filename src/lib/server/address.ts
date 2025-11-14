import { Prisma, type Address } from '@prisma/client';
import prisma from './prisma';
import type { SuperValidated } from 'sveltekit-superforms';
import { addressSchema } from '$lib/validation/auth';
import type z from 'zod/v4';
import { decrypt, encrypt } from './encryption';

export type AddressData = z.infer<typeof addressSchema>;

type AddressFields = {
    addressID?: number;
	lineOne: string;
	lineTwo: string;
	city: string;
	county: string;
	country: string;
	eircode: string;
};

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
export async function createAddressFromForm(form: SuperValidated<AddressData>) {
	let newAddress: Address;
	let { latitude, longitude, ...data } = form.data;

	const coordinatesID = await createCoordinates(longitude, latitude);

	/*if a previous address was created, get a reference to the old coordinates 
    and delete it after the new coordinates has been linked
    */
	if (data.addressID) {
		newAddress = await updateAddress(data, coordinatesID);
	} else {
		newAddress = await prisma.address.create({
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

	return newAddress.id;
}

async function updateAddress(
	data: AddressFields,
	coordinatesID: number
) {
	let previousCoordiantesID: number | undefined = undefined;
	const address = await prisma.address.findFirst({ where: { id: data.addressID } });
	if (address) {
		previousCoordiantesID = address.coordinatesID;
	}

	let newAddress = await prisma.address.update({
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

	if (previousCoordiantesID) {
		await prisma.coordinates.delete({ where: { id: previousCoordiantesID } });
	}
	return newAddress;
}

/**
 * Function that returns the address of the id passed, or throws an error if it is not found
 * @param id the id of the address 
 * @returns an Address object
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
 * Function that takes an encrypted address stored in the database
 * and returns the parts needed for display
 * @param encryptedAddress An encrypted address stored in the database
 * @returns a decrypted address object
 */
export function getDecryptedAddress(encryptedAddress: Address) {
	const decryptedAddress: Partial<Address> = {
		lineOne: decrypt(encryptedAddress.lineOne),
		lineTwo: decrypt(encryptedAddress.lineTwo),
		city: decrypt(encryptedAddress.city),
		county: decrypt(encryptedAddress.county),
		country: decrypt(encryptedAddress.country),
		eircode: decrypt(encryptedAddress.eircode)
	};
	return decryptedAddress;
}

/**
 * Function that creates new coordinates from the form and then 
 * updates the address and connects it with the new coordinates
 * @param form a Supervalidated Address form 
 * @returns the id of the updated address
 */
export async function updateAddressFromForm(form: SuperValidated<AddressData>) {
	let {  latitude, longitude, ...data } =
		form.data;

	const coordinatesID = await createCoordinates(longitude, latitude);

	const updatedAddress = await updateAddress(data, coordinatesID)

	return updatedAddress.id;
}
