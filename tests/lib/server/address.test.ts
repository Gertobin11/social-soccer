import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAddressData, withAddress } from '../../fixtures';
import { addressSchema, type AddressData } from '$lib/validation/auth';
import * as addressORMModule from '$lib/orm/address';
import { createAddressFromForm, getDecryptedAddress, performUpdate, updateAddressFromForm } from '$lib/server/address';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import prisma from '$lib/server/prisma';

describe('createAddressFromForm', () => {
	it('should create an address from a passed form', async () => {
		const createAddressMock = vi.fn().mockResolvedValue({ id: 1 });
		const createCoordinatesMock = vi.fn();
		vi.spyOn(addressORMModule, 'createAddress').mockImplementation(createAddressMock);
		vi.spyOn(addressORMModule, 'createCoordinates').mockImplementation(createCoordinatesMock);

		let longitude = 52.2675;
		let latitude = 9.6962;
		const databaseAddressFieldData = getAddressData(1);
		const addressData: AddressData = { ...databaseAddressFieldData, longitude, latitude };

		const form = await superValidate(addressData, zod4(addressSchema));

		const result = await createAddressFromForm(form);

		expect(result).toBe(1);

		expect(createAddressMock).toHaveBeenCalledOnce();
		expect(createCoordinatesMock).toHaveBeenCalledOnce();
	});

	it('should update an address from a passed form if the form has an addressID', async () => {
		const updateAddressMock = vi.fn().mockResolvedValue({ id: 1 });
		const createCoordinatesMock = vi.fn().mockReturnValue(2);
		vi.spyOn(addressORMModule, 'updateAddress').mockImplementation(updateAddressMock);
		vi.spyOn(addressORMModule, 'createCoordinates').mockImplementation(createCoordinatesMock);

		let longitude = 52.2675;
		let latitude = 9.6962;
		const databaseAddressFieldData = getAddressData(1);
		const addressData: AddressData = {
			...databaseAddressFieldData,
			longitude,
			latitude,
			addressID: 1
		};

		const form = await superValidate(addressData, zod4(addressSchema));

		const result = await createAddressFromForm(form);

		let data = { ...databaseAddressFieldData, addressID: 1 };

		expect(result).toBe(1);

		expect(updateAddressMock).toHaveBeenCalledOnce();
		expect(updateAddressMock).toHaveBeenCalledWith(data, 2);
		expect(createCoordinatesMock).toHaveBeenCalledOnce();
	});
});

describe('performUpdate', () => {
	it('should make a call to update the address', async () => {
		const updateAddressMock = vi.fn().mockResolvedValue({ success: true });
		const getAddressMock = vi.fn();

		vi.spyOn(addressORMModule, 'updateAddress').mockImplementation(updateAddressMock);
		vi.spyOn(addressORMModule, 'getAddress').mockImplementation(getAddressMock);

		const databaseAddressFieldData: AddressFields = getAddressData(1);
		databaseAddressFieldData['addressID'] = 1;

		const result = await performUpdate(databaseAddressFieldData, 11);

		expect(result).toStrictEqual({ success: true });
		expect(getAddressMock).toHaveBeenCalledWith(1);
		expect(updateAddressMock).toHaveBeenCalledWith(databaseAddressFieldData, 11);
	});

	it('should delete a previous linked coordinates ID, if it was previously linked', async () => {
		const updateAddressMock = vi.fn().mockResolvedValue({ success: true });
		const getAddressMock = vi.fn().mockResolvedValue({ coordinatesID: 40 });
		const deleteCoordinatesByIDMock = vi.fn();

		vi.spyOn(addressORMModule, 'updateAddress').mockImplementation(updateAddressMock);
		vi.spyOn(addressORMModule, 'getAddress').mockImplementation(getAddressMock);
		vi.spyOn(addressORMModule, 'deleteCoordinatesByID').mockImplementation(
			deleteCoordinatesByIDMock
		);

		const databaseAddressFieldData: AddressFields = getAddressData(1);
		databaseAddressFieldData['addressID'] = 1;

		const result = await performUpdate(databaseAddressFieldData, 11);

		expect(result).toStrictEqual({ success: true });
		expect(getAddressMock).toHaveBeenCalledWith(1);
		expect(updateAddressMock).toHaveBeenCalledWith(databaseAddressFieldData, 11);
		expect(deleteCoordinatesByIDMock).toHaveBeenCalledWith(40);
	});

	it('should throw an error if addressID is not in the data', async () => {
		const updateAddressMock = vi.fn().mockResolvedValue({ success: true });
		const getAddressMock = vi.fn().mockResolvedValue({ coordinatesID: 40 });
		const deleteCoordinatesByIDMock = vi.fn();

		vi.spyOn(addressORMModule, 'updateAddress').mockImplementation(updateAddressMock);
		vi.spyOn(addressORMModule, 'getAddress').mockImplementation(getAddressMock);
		vi.spyOn(addressORMModule, 'deleteCoordinatesByID').mockImplementation(
			deleteCoordinatesByIDMock
		);

		const databaseAddressFieldData: AddressFields = getAddressData(1);

		await expect(performUpdate(databaseAddressFieldData, 11)).rejects.toThrowError(
			'No addressID present in the form'
		);
	});
});

describe('getDecryptedAddress', () => {
	beforeEach(async () => {
		await prisma.address.deleteMany();
		await prisma.coordinates.deleteMany({});
	});

	afterEach(async () => {
		await prisma.address.deleteMany();
		await prisma.coordinates.deleteMany({});
	});
	it('should return a decrypted address', async () => {
		const address = await withAddress(1, 1, 1);
		const result = getDecryptedAddress(address);
		expect(result.lineOne).toBe('No. 1');
		expect(result.lineTwo).toBe('Main Street');
		expect(result.city).toBe('Tralee');
		expect(result.county).toBe('Kerry');
		expect(result.country).toBe('IE');
		expect(result.eircode).toBe('v92adc4');
	});
});


describe('updateAddressFromForm', () => {
	it('should update an address from a passed form if the form has an addressID', async () => {
		const updateAddressMock = vi.fn().mockResolvedValue({ id: 1 });
		const createCoordinatesMock = vi.fn().mockReturnValue(2);
		vi.spyOn(addressORMModule, 'updateAddress').mockImplementation(updateAddressMock);
		vi.spyOn(addressORMModule, 'createCoordinates').mockImplementation(createCoordinatesMock);

		let longitude = 52.2675;
		let latitude = 9.6962;
		const databaseAddressFieldData = getAddressData(1);
		const addressData: AddressData = {
			...databaseAddressFieldData,
			longitude,
			latitude,
			addressID: 1
		};

		const form = await superValidate(addressData, zod4(addressSchema));

		const result = await updateAddressFromForm(form);

		let data = { ...databaseAddressFieldData, addressID: 1 };

		expect(result).toBe(1);

		expect(updateAddressMock).toHaveBeenCalledOnce();
		expect(updateAddressMock).toHaveBeenCalledWith(data, 2);
		expect(createCoordinatesMock).toHaveBeenCalledOnce();
	});
});
