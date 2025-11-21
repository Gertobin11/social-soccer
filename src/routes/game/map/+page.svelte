<script lang="ts">
	import { config } from 'dotenv';
	import { page } from '$app/state';
	import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
	import { onMount } from 'svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import type { PageProps } from './$types';
	import * as MarkerClusterer from '@googlemaps/markerclusterer';
	import Icon from '@iconify/svelte';
	const flash = getFlash(page);

	let { data }: PageProps = $props();
	// make currentGameData reactive for filtering and searching
	let currentGameData = $state(data.gameDataArray);

	let mapElement: HTMLDivElement;
	let legendElement: HTMLDivElement;

	onMount(async () => {
		try {
			setOptions({
				key: 'AIzaSyD-N4_aJYEE7htoSQAPugjCxfGIZZroAz0'
			});

			// import the class for the map AND marker
			const { Map } = await importLibrary('maps');
			const { AdvancedMarkerElement, PinElement } = await importLibrary('marker');

			// initialise the elements
			const map = new Map(mapElement, {
				center: { lat: 53.397, lng: -8.0 },
				zoom: 7.5,
				mapId: 'create-game-map-id'
			});

			const position = google.maps.ControlPosition.RIGHT_BOTTOM;

			map.controls[position].push(legendElement);

			const infoWindow = new google.maps.InfoWindow({
				content: '',
				disableAutoPan: true
			});

			const markers = currentGameData.map((gameData, i) => {
				let colour = 'green';
				switch (gameData.level) {
					case 'BEGINNER':
						colour = 'green';
						break;
					case 'RECREATIONAL':
						colour = 'blue';
						break;
					case 'INTERMEDITE':
						colour = 'orange';
						break;
					case 'COMPETITIVE':
						colour = 'red';
						break;
					case 'ADVANCED':
						colour = 'black';
						break;
				}
				const title = `${gameData.level}`;
				const pinTextGlyph = new PinElement({
					glyphColor: 'white',
					background: colour,
					borderColor: 'white',
					scale: 1.5
				});

				const marker = new AdvancedMarkerElement({
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
				marker.addListener('click', () => {
					const viewGameURL = `/game/view/${gameData.id}`;
					const contentString = `
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
                                <a href="${data.loggedIn ? viewGameURL: "/auth/register"}" class="btn button-reg w-full items-center justify-center shadow-lg">
                                    ${data.loggedIn ? "View Game Details": "Register To View Details"}
                                </a>
                            </div>
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
	<div class="col-span-2 h-full">
		<div class="h-full w-full" bind:this={mapElement}></div>
	</div>

	<!-- legend -->
	<div
		bind:this={legendElement}
		style="padding: 10px; background-color: white; border: 1px solid #ccc; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
	>
		<h3>Map Legend</h3>
		<div class="flex items-center gap-2">
			<Icon icon="mdi:location" width="24" height="24" class="text-green-700" />
			<span>Beginner Locations</span>
		</div>
		<div class="flex items-center gap-2">
			<Icon icon="mdi:location" width="24" height="24" class="text-blue-700" />
			<span>Recreational Locations</span>
		</div>
		<div class="flex items-center gap-2">
			<Icon icon="mdi:location" width="24" height="24" class="text-orange-700" />
			<span>Intermediate Locations</span>
		</div>
		<div class="flex items-center gap-2">
			<Icon icon="mdi:location" width="24" height="24" class="text-red-700" />
			<span>Competitive Locations</span>
		</div>
		<div class="flex items-center gap-2">
			<Icon icon="mdi:location" width="24" height="24" class="text-black-700" />
			<span>Advanced Locations</span>
		</div>
	</div>
</section>
