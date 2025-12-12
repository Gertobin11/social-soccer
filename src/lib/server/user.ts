import type { User } from '@prisma/client';
import { decrypt } from './encryption';

export async function getDecryptedUserDetails(user: User) {
	let firstName = '';
	let lastName = '';
	if (user.firstName) {
		firstName = decrypt(user.firstName);
	}

	if (user.lastName) {
		lastName = decrypt(user.lastName);
	}

	return { email: user.email, emailVerified: user.emailVerified, firstName, lastName };
}

export class ProfileError extends Error {}
