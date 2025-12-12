import { encrypt } from '$lib/server/encryption';
import { getDecryptedUserDetails } from '$lib/server/user';
import type { User } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('getDecryptedUserDetails', () => {
	it("should return a decrypted user's details", async () => {
		const user = {
			email: 'test@test.ie',
			emailVerified: true,
			firstName: encrypt('Robert'),
			lastName: encrypt('Martin')
		} as unknown as User;

		const result = await getDecryptedUserDetails(user);

		expect(result).toStrictEqual({
			email: 'test@test.ie',
			emailVerified: true,
			firstName: 'Robert',
			lastName: 'Martin'
		});
	});

    it("should return empty strings for first and last name if they are not defined", async () => {
		const user = {
			email: 'test@test.ie',
			emailVerified: true,
			firstName: null,
			lastName: null
		} as unknown as User;

		const result = await getDecryptedUserDetails(user);

		expect(result).toStrictEqual({
			email: 'test@test.ie',
			emailVerified: true,
			firstName: '',
			lastName: ''
		});
	});
});
