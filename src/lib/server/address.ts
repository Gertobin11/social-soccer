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
        INSERT INTO "Coordinates" (location)
        VALUES (
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        )
        RETURNING id;
    `;

	const result = await prisma.$queryRaw<{ id: number }[]>(sql);

    // this will always be present, if not the database will have thrown an error
	const newCoordinateId = result[0]!.id;

	return newCoordinateId;
}

/**
 * 
 * Function that gets a coordinate by its ID
 * @param id the id of the coordinates
 * @returns the coordiantes object 
 */
export async function getCoordinateByID(id: number): Promise<CoordinateWithGeoJSON> {
	const sql = Prisma.sql`
    SELECT
      id,
      ST_AsGeoJSON(location) as location
    FROM "Coordinates"
    WHERE id = ${id};
  `;

	const result = await prisma.$queryRaw<DatabaseCoordinateResult[]>(sql);

	if (!result || result.length < 1) {
		throw new Error('No result returned from database query');
	}

	const rawData = result[0];

	const location = JSON.parse(rawData.location) as GeoJSONPoint;

	return {
		id: rawData.id,
		location
	};
}
