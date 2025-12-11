import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
    createEmailVerificationToken,
	createSession,
	DAY_IN_MS,
	deleteSessionTokenCookie,
	generatePasswordResetToken,
	generateToken,
	generateUserId,
	setSessionTokenCookie,
	validateEmailVerificationToken,
	validateSessionToken
} from '$lib/server/auth';
import * as authORMModule from '$lib/orm/auth';
import { DateTime } from 'luxon';

describe('generateToken', () => {
	it('Should generate a random string', () => {
		const result = generateToken();
		expectTypeOf(result).toEqualTypeOf('string');
		expect(result.length).toBe(24);
	});

	it('Should generate different strings', () => {
		const resultOne = generateToken();
		const resultTwo = generateToken();
		expect(resultOne).not.toBe(resultTwo);
	});
});

describe('createSession', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});
	it('should make a call to the save session with the hexidecimal version of the token', async () => {
		const date = new Date(2000, 1, 1, 13);
		vi.setSystemTime(date);
		const saveSessionMock = vi.fn().mockResolvedValue('success');
		vi.spyOn(authORMModule, 'saveSession').mockImplementation(saveSessionMock);
		const result = await createSession('testtoken', 'test user id');
		expect(result).toBe('success');
		expect(saveSessionMock).toBeCalledWith(
			'ada63e98fe50eccb55036d88eda4b2c3709f53c2b65bc0335797067e9a2a5d8b',
			'test user id',
			new Date(Date.now() + DAY_IN_MS * 30)
		);
	});
});

describe('validateSessionToken', () => {
	it('should return the session object that matches the token', async () => {
		const validDate = DateTime.now().plus({ days: 24 });
		const sessionString = 'testString';
		const sessionMock = vi
			.fn()
			.mockResolvedValue({ expiresAt: validDate.toJSDate(), user: 'test' });
		vi.spyOn(authORMModule, 'getSessionByID').mockImplementation(sessionMock);

		const result = await validateSessionToken(sessionString);

		expect(result).toStrictEqual({
			session: {
				expiresAt: validDate.toJSDate(),
				user: 'test'
			},
			user: 'test'
		});
		expect(sessionMock).toHaveBeenCalledOnce();
	});

	it('should return null if no session is found', async () => {
		const sessionString = 'testString';
		const sessionMock = vi.fn();
		vi.spyOn(authORMModule, 'getSessionByID').mockImplementation(sessionMock);

		const result = await validateSessionToken(sessionString);

		expect(result).toStrictEqual({
			session: null,
			user: null
		});
		expect(sessionMock).toHaveBeenCalledOnce();
	});

	it('should call invalidate session if the token is expired and renew the expiry', async () => {
		const expiredDate = DateTime.now().minus({ days: 1 });
		const sessionString = 'testString';
		const invalidateSessionMock = vi.fn();
		const updateSessionMock = vi.fn();
		const sessionMock = vi
			.fn()
			.mockResolvedValue({ expiresAt: expiredDate.toJSDate(), user: 'test', token: sessionString });

		vi.spyOn(authORMModule, 'getSessionByID').mockImplementation(sessionMock);
		vi.spyOn(authORMModule, 'invalidateSession').mockImplementation(invalidateSessionMock);
		vi.spyOn(authORMModule, 'updateSession').mockImplementation(updateSessionMock);

		await validateSessionToken(sessionString);

		expect(invalidateSessionMock).toHaveBeenCalledWith(sessionString);
		expect(sessionMock).toHaveBeenCalledOnce();
		expect(updateSessionMock).toHaveBeenCalledOnce();
	});
});
interface MockRequestEvent {
	cookies: {
		set: (name: string, value: string, options: any) => void;
		delete: (name: string, options: any) => void;
	};
}

const createMockEvent = (): MockRequestEvent => ({
	cookies: {
		set: vi.fn(),
		delete: vi.fn()
	}
});

describe('setSessionTokenCookie', () => {
	it('should call event.cookies.set with the correct name, token, and options', () => {
		const eventMock = createMockEvent();
		const testToken = 'test token';
		const testExpiresAt = DateTime.now().plus({days:30}).toJSDate()

		setSessionTokenCookie(eventMock as any, testToken, testExpiresAt);

		expect(eventMock.cookies.set).toHaveBeenCalledTimes(1);
		expect(eventMock.cookies.set).toHaveBeenCalledWith('auth-session', testToken, {
			expires: testExpiresAt,
			path: '/'
		});
	});
});

describe('deleteSessionTokenCookie', () => {
	it('should call event.cookies.delete with the correct cookie name and path', () => {
		const eventMock = createMockEvent();

		deleteSessionTokenCookie(eventMock as any);

		expect(eventMock.cookies.delete).toHaveBeenCalledTimes(1);
		expect(eventMock.cookies.delete).toHaveBeenCalledWith('auth-session', { path: '/' });
	});
});

describe("generateUserId", () => {
    it("should generate a random string to be used as a userID", () => {
        let result = generateUserId()
        expectTypeOf(result).toEqualTypeOf("string")
        expect(result.length).toBe(24)
    })
})

describe("createEmailVerificationToken", () => {
    it("should make a call to delete previous tokens and create a new token", async ()=> {
        const deleteAllEmailVerificationTokensMock = vi.fn()
        const saveEmailVerificationTokenMock = vi.fn()
        vi.spyOn(authORMModule, 'deleteAllEmailVerificationTokens').mockImplementation(deleteAllEmailVerificationTokensMock)
        vi.spyOn(authORMModule, 'saveEmailVerificationToken').mockImplementation(saveEmailVerificationTokenMock)

        const result = await createEmailVerificationToken("test user id")

        expect(deleteAllEmailVerificationTokensMock).toHaveBeenCalledWith("test user id")

        expect(saveEmailVerificationTokenMock).toHaveBeenCalledOnce()

        expect(result.length).toBe(24)
        expectTypeOf(result).toEqualTypeOf("string")
    })
})

describe("validateEmailVerificationToken", () => {
    it("should return the linked userID from the token", async () => {
        const validDate = DateTime.now().plus({days: 1}).toMillis()
        const getEmailValidationTokenMock = vi.fn().mockResolvedValue({
            expires: validDate,
            userID: "test user"
        })
        vi.spyOn(authORMModule, 'getEmailValidationToken').mockImplementation(getEmailValidationTokenMock)
        const result = await validateEmailVerificationToken("test token")

        expect(getEmailValidationTokenMock).toHaveBeenCalledWith("test token")
        expect(result).toBe("test user")
    })

    it("should throw an error if the token is expired", async () => {
        const validDate = DateTime.now().minus({days: 1}).toMillis()
        const getEmailValidationTokenMock = vi.fn().mockResolvedValue({
            expires: validDate,
            userID: "test user"
        })
        vi.spyOn(authORMModule, 'getEmailValidationToken').mockImplementation(getEmailValidationTokenMock)
        await expect(validateEmailVerificationToken("test token")).rejects.toThrowError("Expired token")

    })
})

describe('generatePasswordResetToken', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});
	it('should make a call to the create a password reset token', async () => {
		const date = new Date(2000, 1, 1, 13);
		vi.setSystemTime(date);
		const generatePasswordResetTokenMock = vi.fn().mockResolvedValue('success');
		vi.spyOn(authORMModule, 'createPasswordResetToken').mockImplementation(generatePasswordResetTokenMock);
		const result = await generatePasswordResetToken('test user id');
		expect(result.length).toBe(24);
        expectTypeOf(result).toEqualTypeOf("string")
		
		expect(generatePasswordResetTokenMock).toHaveBeenCalledOnce()
	});
});