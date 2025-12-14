import type { MapGameData } from '$lib/server/game';
import { importLibrary } from '@googlemaps/js-api-loader';
import type { Level, Prisma, Rating } from '@prisma/client';

/**
 * Function that returns the average of all the ratings
 * @param ratings Rating[]
 * @returns number | undefined
 */
export function getAverageRating(ratings: Rating[]) {
	if (ratings.length > 0) {
		const totalRatings = ratings.reduce((acc, cur) => acc + cur.rating, 0);
		return totalRatings / ratings.length;
	}
}

export type RequestWithRelatedFields = Prisma.RequestToJoinGetPayload<{
	include: { player: { include: { ratings: true } }; game: true };
}>;

/**
 * Function that builds the card that shows up when a user clicks on a location on the map,
 * Returns the html in a string to be parsed
 * @param gameData MapGameData
 * @param loggedIn boolean
 * @param viewGameURL
 * @returns string
 */
export function buildMapCard(gameData: MapGameData, loggedIn: boolean, viewGameURL: string) {
	return `
            <div class="w-[280px] overflow-hidden rounded-2xl bg-white shadow-2xl font-sans">
                
                <div class="relative bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Level</span>
                    <span class="text-lg font-bold text-primary-600">${gameData.level}</span>
                </div>

                <div class="px-5 py-4 space-y-4">
                    
                    <div class="flex justify-between">
                        <div>
                            <p class="text-[10px] font-bold uppercase text-gray-400">Date</p>
                            <p class="text-sm font-semibold text-gray-800">${gameData.day}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold uppercase text-gray-400">Time</p>
                            <p class="text-sm font-semibold text-gray-800">${gameData.time}</p>
                        </div>
                    </div>

                    <div class="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <div class="flex justify-between items-end mb-1">
                            <span class="text-[10px] font-bold uppercase text-gray-400">Players Joined</span>
                            <div class="text-sm font-bold text-gray-800">
                                <span class="text-primary-600">${gameData.currentPlayerNumbers}</span>
                                <span class="text-gray-400">/</span>
                                <span>${gameData.numberOfPlayers}</span>
                            </div>
                        </div>
                        <div class="h-1.5 w-full rounded-full bg-gray-200">
                            <div class="h-1.5 rounded-full bg-secondary-500" 
                                style="width: ${(gameData.currentPlayerNumbers / gameData.numberOfPlayers) * 100}%">
                            </div>
                        </div>
                    </div>

                </div>

                <div class="flex items-center justify-center py-3">
                    <a href="${loggedIn ? viewGameURL : '/auth/register'}" class="btn button-reg w-full items-center justify-center shadow-lg">
                        ${loggedIn ? 'View Game Details' : 'Register To View Details'}
                    </a>
                </div>
            </div>
            `;
}

/**
 * Function that creates markers from the game data
 * for the map that is passed in
 * @param currentGameData MapGameData[]
 * @param map google.maps.Map
 * @param infoWindow google.maps.InfoWindow
 * @param loggedIn  boolean
 * @returns Promise<google.maps.marker.AdvancedMarkerElement[]>
 */
export async function createMarkers(
	currentGameData: MapGameData[],
	map: google.maps.Map,
	infoWindow: google.maps.InfoWindow,
	loggedIn: boolean
) {
	const { AdvancedMarkerElement, PinElement } = await importLibrary('marker');
	return currentGameData.map((gameData, i) => {
		let colour = getLevelColour(gameData.level);
		const title = `${gameData.level}`;
		const pinTextGlyph = new PinElement({
			glyphColor: 'white',
			background: colour,
			borderColor: 'white',
			scale: 1.5
		});

		let marker = new AdvancedMarkerElement({
			position: {
				lat: Number(gameData.coordinates.location.coordinates[1]),
				lng: Number(gameData.coordinates.location.coordinates[0])
			},
			map,
			title
		});

		marker.append(pinTextGlyph);
		marker.style.overflow = 'hidden !important';

		// show the game details when a marker is clicked
		addOnClickFunction(marker, gameData, loggedIn, infoWindow, map);
		return marker;
	});
}

/**
 * Function that adds an event listener to a marker, so that when it 
 * is clicked it will show the card content
 * @param marker google.maps.marker.AdvancedMarkerElement
 * @param gameData MapGameData
 * @param loggedIn boolean
 * @param infoWindow google.maps.InfoWindow
 * @param map google.maps.Map
 */
export function addOnClickFunction(
	marker: google.maps.marker.AdvancedMarkerElement,
	gameData: MapGameData,
	loggedIn: boolean,
	infoWindow: google.maps.InfoWindow,
	map: google.maps.Map
) {
	marker.addListener('click', () => {
		const viewGameURL = `/game/view/${gameData.id}`;

		const contentString = buildMapCard(gameData, loggedIn, viewGameURL);

		infoWindow.setContent(contentString);
		infoWindow.open(map, marker);
	});
}

/**
 * Function that returns the colour associated with the 
 * passed in Level
 * @param level Level
 * @returns string
 */
export function getLevelColour(level: keyof typeof Level) {
	switch (level) {
		case 'BEGINNER':
			return 'green';
		case 'RECREATIONAL':
			return 'blue';
		case 'INTERMEDITE':
			return 'orange';
		case 'COMPETITIVE':
			return 'red';
		case 'ADVANCED':
			return 'black';
		default:
			return 'green';
	}
}
