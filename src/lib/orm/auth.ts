import prisma from '../server/prisma';

/**
 * Function that creates a token for a user to rest their password
 * @param userID the user id that owns the password reset token
 * @param token the token string
 * @param expires the Date when the token is no longer valid
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
 * @param token the email verificationToken
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
 * @param token the string value of the token
 * @param userID te id of the User
 * @param expires the date of when the token expires in milliseconds
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
 * @param sessionId the id of the session to delete
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
 * @param token the string token 
 * @param newExpiration the new expiration date
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
 * @param sessionID the id of the session
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
 * @param sessionID the session ID to be stored
 * @param userID the id of the User to link the session 
 * @param expiresAt the Date of when the session is not active
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
 * @param userID the id of the user who's emailVerification tokens are to be deleted
 */
export async function deleteAllEmailVerificationTokens(userID: string) {
	await prisma.emailVerification.deleteMany({ where: { userID } });
}
