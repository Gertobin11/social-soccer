import { encrypt } from '$lib/server/encryption';
import type { Prisma } from '@prisma/client';
import prisma from '../server/prisma';

export async function addNamesToUser(userID: string, firstName: string, lastName: string) {
	await prisma.user.update({
		where: {
			id: userID
		},
		data: {
			firstName: encrypt(firstName),
			lastName: encrypt(lastName)
		}
	});
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
			games: true,
			ratings: true
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

export type UserWithRatings = Prisma.UserGetPayload<{ include: { ratings: true } }>;

export async function createRating(userID: string, gameID: number, rating: number) {
	return await prisma.rating.create({
		data: {
			playerID: userID,
			gameID,
			rating
		}
	});
}

export async function updateRating(userID: string, gameID: number, rating: number) {
	return await prisma.rating.update({
		where: {
			uniqueRating: {
				playerID: userID,
				gameID
			}
		},
		data: {
			playerID: userID,
			gameID,
			rating
		}
	});
}

export async function getRating(userID: string, gameID: number) {
	return await prisma.rating.findUnique({
		where: {
			uniqueRating: {
				playerID: userID,
				gameID
			}
		}
	});
}
