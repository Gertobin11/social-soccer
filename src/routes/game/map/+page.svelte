<script lang="ts">
	import { page } from '$app/state';
	import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
	import { onMount } from 'svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import type { PageProps } from './$types';
	import * as MarkerClusterer from '@googlemaps/markerclusterer';
	const flash = getFlash(page);

	let { data }: PageProps = $props();
	// make currentGameData reactive for filtering and searching
	let currentGameData = $state(data.gameDataArray);

	let mapElement: HTMLDivElement;

	onMount(async () => {
		try {
			setOptions({
				key: 'AIzaSyD-N4_aJYEE7htoSQAPugjCxfGIZZroAz0'
			});

			// import the class for the map, marker and location lookup
			const { Map } = await importLibrary('maps');
			const { AdvancedMarkerElement } = await importLibrary('marker');

			// initialise the elements
			const map = new Map(mapElement, {
				center: { lat: 53.397, lng: -8.0 },
				zoom: 7.5,
				mapId: 'create-game-map-id'
			});

			const infoWindow = new google.maps.InfoWindow({
				content: '',
				disableAutoPan: true
			});

			const markers = currentGameData.map((gameData, i) => {
				const label = `${gameData.city} - ${gameData.level}`;
				const pinGlyph = new google.maps.marker.PinElement({
					glyph: label,
					glyphColor: 'black'
				});
				const marker = new google.maps.marker.AdvancedMarkerElement({
					position: {
						lat: Number(gameData.coordinates.location.coordinates[1]),
						lng: Number(gameData.coordinates.location.coordinates[0])
					},
					content: pinGlyph.element
				});

				// show the game details when a marker is clicked
				marker.addListener('click', () => {
					const addressLineTwo = gameData.lineTwo ? `${gameData.lineTwo}<br>` : '';
					const joinGameUrl = `/`;
					const contentString = `
                        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; max-width: 280px;">
                            
                            <strong style="font-size: 1.1rem; color: #333;">
                                Level: ${gameData.level}
                            </strong>

                            <p style="margin: 8px 0 0 0;">
                                <strong>Date:</strong> ${gameData.day}<br>
                                <strong>Time:</strong> ${gameData.time}
                            </p>
                            
                            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
                            
                            <p style="margin: 0 0 12px 0;">
                                <strong>Address:</strong><br>
                                ${gameData.lineOne}<br>
                                ${addressLineTwo}
                                ${gameData.city}, ${gameData.county}<br>
                                ${gameData.eircode}
                            </p>
                            
                            <a href="${joinGameUrl}" 
                            style="color: #1a73e8; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                Request to Join Game
                            </a>
                        </div>
                            `;

					infoWindow.setContent(contentString);
					infoWindow.open(map, marker);
				});
				return marker;
			});

			// Add a marker clusterer to manage the markers.
			new MarkerClusterer.MarkerClusterer({ markers, map });
		} catch (error) {
			console.log(error);
			$flash = {
				type: 'error',
				message: 'Unable to load map, please check the google api is allowed by your browser'
			};
		}
	});
</script>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-3">
	<!-- Map section for picking the address-->
	<div class="h-full col-span-2">
		<div class="h-full w-full" bind:this={mapElement}></div>
	</div>
</section>
