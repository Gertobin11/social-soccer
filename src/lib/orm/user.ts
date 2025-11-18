import prisma from '../server/prisma';

export async  function addNamesToUser(userID: string, firstName: string, lastName: string) {
    await prisma.user.update({
        where: {
            id: userID
        },
        data:{
            firstName,
            lastName
        }
    })
}

/**
 * function that looks up a user object by its id
 * @param id the id of the user
 * @returns the user object waith its related fields or null
 */
export async function getUserByID(id: string) {
	return await prisma.user.findUnique({
		where: {
			id
		},
		include: {
			emailVerification: true,
			sessions: true,
			passwordResetToken: true,
            address: true,
            games: true
		}
	});
}

/**
 * FUnction that links a user to an address
 * @param userID the users ID
 * @param addressID the address' ID
 */
export async function addAddressToUser(userID: string, addressID: number) {
	await prisma.user.update({
		where: {
			id: userID
		},
		data: {
			addressID
		}
	});
}