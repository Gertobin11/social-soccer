import {
	createPasswordResetToken,
	deleteAllEmailVerificationTokens,
	getEmailValidationToken,
	getSessionByID,
	invalidateSession,
	saveEmailVerificationToken,
	saveSession,
	updateSession
} from '$lib/orm/auth';
import prisma from '$lib/server/prisma';
import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { withUser } from '../../fixtures';
import { createSession } from '$lib/server/auth';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

describe('createPasswordResetToken', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should create a password reset token', async () => {
		const user = await withUser();
		const sevenDaysTime = DateTime.now().plus({ days: 7 });
		const expires = sevenDaysTime.toJSDate();
		const token = 'this is a test token';

		const result = await createPasswordResetToken(user.id, token, expires);

		expect(result.expiresAt).toStrictEqual(expires);
		expect(result.token).toBe(token);
		expect(result.userID).toBe(user.id);
	});
});

describe('getEmailValidationToken', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should return the email validation token', async () => {
		const user = await withUser();
		const sevenDaysTime = DateTime.now().plus({ days: 7 });
		const expires = sevenDaysTime.toMillis();
		const stringToken = 'this is a test token';

		const token = await saveEmailVerificationToken(stringToken, user.id, expires);

		const result = await getEmailValidationToken(token.id);

		expect(Number(result.expires)).toBe(expires);
		expect(result.userID).toBe(user.id);
		expect(result.id).toBe(token.id);
	});

	it('should delete any session entries associated with the user', async () => {
		const user = await withUser();
		const sevenDaysTime = DateTime.now().plus({ days: 7 });
		const expires = sevenDaysTime.toMillis();
		const stringToken = 'this is a test token';

		const token = await saveEmailVerificationToken(stringToken, user.id, expires);
		const session = await saveSession('session token', user.id, sevenDaysTime.toJSDate());

		const result = await getEmailValidationToken(token.id);

		expect(Number(result.expires)).toBe(expires);
		expect(result.userID).toBe(user.id);
		expect(result.id).toBe(token.id);

		const storedSession = await prisma.session.findUnique({
			where: {
				token: session.token
			}
		});

		expect(storedSession).toBeNull();
	});

	it('should throw an error if no email verification token is form', async () => {
		await expect(getEmailValidationToken('-1')).rejects.toThrowError('Invalid token');
	});
});

describe('updateSession', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should update a session with a new expiry', async () => {
		const user = await withUser();
		const session = await createSession('test token', user.id);
		const newExpiration = DateTime.now().plus({ days: 30 }).toJSDate();

		const result = await updateSession(session.token, newExpiration);
		expect(result.expiresAt).toStrictEqual(newExpiration);
	});
});

describe('getSessionByID', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should return the matching session', async () => {
		const user = await withUser();
		const session = await createSession('test token', user.id);

		const result = await getSessionByID(session.token);

		if (!result) {
			throw new Error('No result found');
		}

		expect(result.token).toBe(session.token);
		expect(result.expiresAt).toStrictEqual(session.expiresAt);
		expect(result.userID).toBe(user.id);
	});

	it('should return null if no matching session was found', async () => {
		const user = await withUser();
		await createSession('test token', user.id);

		const result = await getSessionByID('bad token');

		expect(result).toBeNull();
	});
});

describe("invalidateSession", () => {
    beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
    it("should delete the session that matchess the passed ID", async () => {
        const user = await withUser();
		const session =await createSession('test token', user.id);

        await invalidateSession(session.token)

        const result  = await prisma.session.findFirst({
            where: {
                token: session.token
            }
        })

        expect(result).toBeNull()
    })
})

describe('saveSession', () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should save a session with the passed details', async () => {
		const DAY_IN_MS = 1000 * 60 * 60 * 24;
		const user = await withUser();
		const sessionID = encodeHexLowerCase(sha256(new TextEncoder().encode('test token')));
		const expiresAt = new Date(Date.now() + DAY_IN_MS * 30);

		const result = await saveSession(sessionID, user.id, expiresAt);

		expect(result.expiresAt).toStrictEqual(expiresAt);
		expect(result.token).toBe(sessionID);
		expect(result.userID).toBe(user.id);
	});
});

describe('deleteAllEmailVerificationTokens', () => {
    beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
	});
	it('should delete all linked email verification tokens', async () => {
		const user = await withUser();
		const sevenDaysTime = DateTime.now().plus({ days: 7 });
		const expires = sevenDaysTime.toMillis();
		const stringToken = 'this is a test token';

		await saveEmailVerificationToken(stringToken, user.id, expires);
		await saveEmailVerificationToken(stringToken + '2', user.id, expires);
		await saveEmailVerificationToken(stringToken + '3', user.id, expires);

		let emailVerifications = await prisma.emailVerification.findMany({
			where: {
				userID: user.id
			}
		});
		expect(emailVerifications.length).toBe(3);

		await deleteAllEmailVerificationTokens(user.id);

		emailVerifications = await prisma.emailVerification.findMany({
			where: {
				userID: user.id
			}
		});
		expect(emailVerifications.length).toBe(0);
	});
});
