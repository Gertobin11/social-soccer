import prisma from '../server/prisma';

/**
 * Function that creates a token for a user to rest their password
 * @param userID number
 * @param token tring
 * @param expires Date
 */
export async function createPasswordResetToken(userID: string, token: string, expires: Date) {
	return await prisma.passwordResetToken.create({
		data: {
			userID,
			token,
			expiresAt: expires
		}
	});
}
/**
 * Function thate gets and returns the email verification token, and also 
 * deletes any current sessions attached to the user and the email verification token itself
 * @param token string
 * @returns Promise<EmailVerification>
 */
export async function getEmailValidationToken(token: string) {
	return await prisma.$transaction(async (tx) => {
		const storedToken = await tx.emailVerification.findFirst({ where: { id: token } });

		if (!storedToken) {
			throw new Error('Invalid token');
		}

		// clean up, deleting the verification token and any old sessions
		await tx.emailVerification.delete({ where: { id: token } });

		await tx.session.deleteMany({
			where: {
				userID: storedToken.userID
			}
		});

		return storedToken;
	});
}

/**
 * Function that saves the email verification object
 * @param token string
 * @param userID string
 * @param expires number
 * @returns Promise<EmailVerification>
 */
export async function saveEmailVerificationToken(token: string, userID: string, expires: number) {
	return await prisma.emailVerification.create({
		data: {
			id: token,
			userID,
			expires
		}
	});
}

/**
 * Function that deletes the record of the session 
 * @param sessionId string
 */
export async function invalidateSession(sessionId: string) {
	await prisma.session.delete({
		where: {
			token: sessionId
		}
	});
}

/**
 * Function that updates a session token with a new expiration date
 * @param token string
 * @param newExpiration Date
 * @returns Promise<Session>
 */
export async function updateSession(token: string, newExpiration: Date) {
	return await prisma.session.update({
		where: {
			token: token
		},
		data: {
			expiresAt: newExpiration
		}
	});
}

/**
 * Function that returns the Session of the matching id
 * @param sessionID string
 * @returns Promise<Session>
 */
export async function getSessionByID(sessionID: string) {
	return await prisma.session.findUnique({
		where: {
			token: sessionID
		},
		include: {
			user: true
		}
	});
}

/**
 * Function that saves a session 
 * @param sessionID string
 * @param userID string
 * @param expiresAt Date
 * @returns Promise<Session>
 */
export async function saveSession(sessionID: string, userID: string, expiresAt: Date) {
	return await prisma.session.create({
		data: {
			token: sessionID,
			userID,
			expiresAt
		}
	});
}

/**
 * Function that deletes all the linked email verification tokens
 * @param userID string
 */
export async function deleteAllEmailVerificationTokens(userID: string) {
	await prisma.emailVerification.deleteMany({ where: { userID } });
}
