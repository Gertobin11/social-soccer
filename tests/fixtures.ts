import { createAddress, createCoordinates } from "$lib/orm/address";
import { createUser } from "$lib/orm/user";
import { hash } from "@node-rs/argon2";

export async function withAddress(longitude: number, latitude: number, i: number) {
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

export async function withUser() {
    const passwordHash = await hash('test password', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    const user = await createUser('abcderasa', 'test@gmail.com', passwordHash);
    return user;
}

