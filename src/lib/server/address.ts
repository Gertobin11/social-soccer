import { Prisma } from '@prisma/client';
import prisma from './prisma';

/**
 * Create a new coordinates object in the database using a raw query 
 * as currently postgids is not supported in prisma
 * @param longitude the longitude of the coordinate
 * @param latitude the latitude of the coordinates
 * @returns the id of the new coordinates
 */
export async function createCoordinates(longitude: number, latitude: number): Promise<number> {
    // using Prisma.sql to protect against sql injection
	const sql = Prisma.sql`
        INSERT INTO "Coordinates" (coordinates)
        VALUES (
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        )
        RETURNING id;
    `;

	const result = await prisma.$queryRaw<{ id: number }[]>(sql);

	const newCoordinateId = result[0]?.id;

	if (!newCoordinateId) {
		throw new Error('Coordinate insertion failed to return a new ID.');
	}

	return newCoordinateId;
}
