import type { SuperValidated } from 'sveltekit-superforms';
import { type AddressData } from '$lib/validation/auth';
import { decrypt } from './encryption';
import {
	createAddress,
	createCoordinates,
	deleteCoordinatesByID,
	getAddress,
	updateAddress
} from '$lib/orm/address';
import type { Address } from '@prisma/client';

/**
 * Function that either calls thw ORM to create a new address, which is encryped,
 * or if there is a previous address, it calls the orm to update the address with
 * the new coordinates, then calls the orm to  delete the old cordinates
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
		newAddress = await performUpdate(data, coordinatesID);
	} else {
		newAddress = await createAddress(data, coordinatesID);
	}

	return newAddress.id;
}

/**
 *
 * @param data Function that calls the orm to update the address
 * with the new details and new coordinates and calls the orm to
 * deete the old referece
 * @param coordinatesID the id of the new coordinates
 * @returns the new address object
 */
export async function performUpdate(data: AddressFields, coordinatesID: number) {
	let previousCoordiantesID: number | undefined = undefined;

	if (!data.addressID) {
		throw new Error('No addressID present in the fom');
	}

	const address = await getAddress(data.addressID);
	if (address) {
		previousCoordiantesID = address.coordinatesID;
	}

	let newAddress = await updateAddress(data, coordinatesID);

	if (previousCoordiantesID) {
		await deleteCoordinatesByID(previousCoordiantesID);
	}
	return newAddress;
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
 * Function thatcalls the orm to create a new coordinates entry
 * and then makes the call to perform the address update
 * with the new coordinates id and the form
 * @param form a Supervalidated Address form
 * @returns the id of the updated address
 */
export async function updateAddressFromForm(form: SuperValidated<AddressData>) {
	let { latitude, longitude, ...data } = form.data;

	const coordinatesID = await createCoordinates(longitude, latitude);

	const updatedAddress = await performUpdate(data, coordinatesID);

	return updatedAddress.id;
}
