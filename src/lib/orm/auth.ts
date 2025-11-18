import prisma from '../server/prisma';


export async function createPasswordResetToken(userID: string, token: string, expires: Date) {
    await prisma.passwordResetToken.create({
        data: {
            userID,
            token,
            expiresAt: expires
        }
    });
}

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

export async function saveEmailVerificationToken(token: string, userID: string, expires: number) {
    await prisma.emailVerification.create({
        data: {
            id: token,
            userID,
            expires
        }
    });
}

export async function invalidateSession(sessionId: string) {
    await prisma.session.delete({
        where: {
            token: sessionId
        }
    })
}

export async function updateSession(token: string , newExpiration: Date) {
    await prisma.session.update({
        where: {
            token: token
        },
        data: {
            expiresAt: newExpiration
        }
    });
}

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

export async function saveSession(sessionId: string, userID: string, expiresAt: Date) {
    return await prisma.session.create({
        data: {
            token: sessionId,
            userID,
            expiresAt
        }
    });
}

export async function deleteAllEmailVerificationTokens(userID: string) {
    await prisma.emailVerification.deleteMany({ where: { userID } });
}