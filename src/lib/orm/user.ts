import { encrypt } from '$lib/server/encryption';
import type { Prisma } from '@prisma/client';
import prisma from '../server/prisma';

/**
 * Fuction that updates the User with a first and second name
 * @param userID string
 * @param firstName string
 * @param lastName string
 */
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
 * Function that creates a user in the database
 * @param userID string
 * @param email string
 * @param passwordHash string
 * @returns Promise<User>
 */
export async function createUser(userID: string, email: string, passwordHash: string) {
	return await prisma.user.create({
		data: {
			id: userID,
			email,
			emailVerified: false,
			passwordHash
		},
		include: { ratings: true }
	});
}

/**
 * function that looks up a user object by its id
 * @param id string
 * @returns Promise<User | null>
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
 * Function that looks up a user by eail and returns the User or null
 * @param email string
 * @returns Promise<User | null>
 */
export async function getUserByEmail(email: string) {
	return await prisma.user.findUnique({
		where: {
			email
		}
	});
}

/**
 * Function that links a user to an address
 * @param userID string
 * @param addressID number
 * @returns Promise<User>
 */
export async function addAddressToUser(userID: string, addressID: number) {
	return await prisma.user.update({
		where: {
			id: userID
		},
		data: {
			addressID
		}
	});
}

export type UserWithRatings = Prisma.UserGetPayload<{ include: { ratings: true } }>;

/**
 * Function that creates a rating for a player in the passes game
 * @param userID string
 * @param gameID number
 * @param rating number
 * @returns Promise<Rating>
 */
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
			rating
		}
	});
}

/**
 * Function that queries the database for a rating that matches the user and payer ID's
 * @param userID string
 * @param gameID number
 * @returns Promise<Rating | null>
 */
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
