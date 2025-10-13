import prisma from "./prisma";

/**
 * function that looks up a user object by its id
 * @param id the id of the user
 * @returns the user object with its related fields or null
 */
export async function getUserByID(id: string) {
    return await prisma.user.findUnique({
        where: {
            id
        },
        include: {
            emailVerification: true,
            sessions: true,
            passwordResetToken: true
        }
    })
}