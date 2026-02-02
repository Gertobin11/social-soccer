import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from '../$types';
import { getUserByID } from '$lib/orm/user';
import { ProfileError } from '$lib/server/user';
import { buildClosestGameData } from '$lib/server/game';
import { findNearestGames, getCoordinateByID } from '$lib/orm/address';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (event) => {
	// redirect to the homepage if the user is not signed in
	if (!event.locals.session) {
		return redirect(
			'/',
			{ type: 'error', message: 'You must be signed in to view this page' },
			event
		);
	}

	try {
		const user = await getUserByID(event.locals.session.userID);

		if (!user) {
			throw new Error(`User with id: ${event.locals.session.userID} not found`);
		}

		if (!user.address) {
			throw new ProfileError('Profile not complete, no address found');
		}

		const userCoordinates = await getCoordinateByID(user.address.coordinatesID);

		const nearestGames = await findNearestGames(
			userCoordinates.location.coordinates[0],
			userCoordinates.location.coordinates[1],
			10
		);

		const nearestGameData = await buildClosestGameData(nearestGames);

        const googleMapAPIKey = env.GOOGLE_MAP_API_KEY

		return { nearestGameData, googleMapAPIKey };
	} catch (error) {
		if (error instanceof ProfileError) {
			return redirect(
				'/profile/add-address',
				{
					type: 'error',
					message:
						' Unable to load nearest games, please complete your profile by adding your address'
				},
				event
			);
		} else {
			return redirect(
				'/',
				{ type: 'error', message: ' Unable to load nearest games, please contact support' },
				event
			);
		}
	}
};
