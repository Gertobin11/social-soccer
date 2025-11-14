import prisma from './prisma';

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
            address: true
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
