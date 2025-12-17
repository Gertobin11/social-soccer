<script lang="ts">
	import { page } from '$app/state';
	import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
	import { onMount } from 'svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import type { PageProps } from './$types';
	import * as MarkerClusterer from '@googlemaps/markerclusterer';
	import Icon from '@iconify/svelte';
	import Title from '$lib/components/ui/Title.svelte';
	import { getLevelColour } from '$lib/client/games';
	import MetaTags from '$lib/components/functional/MetaTags.svelte';
	const flash = getFlash(page);

	let { data }: PageProps = $props();
	// make currentGameData reactive for filtering and searching
	let currentGameData = $state(data.nearestGameData);

	let mapElement: HTMLDivElement;
	let legendElement: HTMLDivElement;

	onMount(async () => {
		try {
			setOptions({
				key: data.googleMapAPIKey
			});

			// import the class for the map AND marker
			const { Map } = await importLibrary('maps');
			const { AdvancedMarkerElement, PinElement } = await importLibrary('marker');

			// initialise the elements
			const map = new Map(mapElement, {
				center: { lat: 53.397, lng: -8.0 },
				zoom: 7.5,
				mapId: 'nearest-games-id'
			});

			const position = google.maps.ControlPosition.RIGHT_BOTTOM;

			map.controls[position].push(legendElement);

			const infoWindow = new google.maps.InfoWindow({
				content: '',
				disableAutoPan: true
			});

			const markers = currentGameData.map((gameData, i) => {
				let colour = getLevelColour(gameData.level)
				const title = `${gameData.level}`;
				const pinTextGlyph = new PinElement({
					glyphColor: 'white',
					background: colour,
					borderColor: 'white',
					scale: 1.5
				});

				const marker = new AdvancedMarkerElement({
					position: {
						lat: Number(gameData.geoLocation.coordinates[1]),
						lng: Number(gameData.geoLocation.coordinates[0])
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

                            <div class="flex justify-between items-center">                          
                                        <p class="text font-bold uppercase text-gray-400">Distance from you</p>
                                        <p class="text-sm font-semibold text-gray-800">${(gameData.distance / 1000).toFixed(2)} km</p>
                                    
                                </div>
                                
                                <div class="flex justify-between px-2">
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
                                <a href="${viewGameURL}" class="btn button-reg w-full items-center justify-center shadow-lg">
                                    View Game Details
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

<MetaTags
	description="Using your address, see active football matches near you"
	title="Social Soccer | View Games Near Me"
/>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-3">
	<!-- Map section for picking the address-->
	<div class="col-span-2 h-full">
		<div class="h-full w-full min-h-[calc(100vh-8rem)]" bind:this={mapElement}></div>
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

	<!-- Card for interacting with the map-->
	<div
		class="col-span-1 flex h-[calc(100vh-4rem)] flex-col items-center justify-start gap-12 overflow-y-auto pt-12"
	>
		<div class="flex flex-col items-center">
			<Title title="Games Near Me"></Title>
		</div>
		<div class="flex w-full flex-col items-center justify-start gap-3">
			{#each currentGameData as gameData}
				<div class="w-2/3 overflow-hidden rounded-lg bg-white shadow-xl">
					<div>
						<h2
							class="py-2 pr-4 pl-4 text-lg text-white bg-{getLevelColour(
								gameData.level
							)}{gameData.level !== 'ADVANCED' ? '-500' : ''}"
						>
							{gameData.level}
						</h2>
					</div>
					<div class="p-4">
						<p>{gameData.day} - {gameData.time}</p>
						<p>{(gameData.distance / 1000).toFixed(2)} km from you</p>
						<a href={`/game/view/${gameData.id}`} class="font-semibold underline">View Details</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

/<!-- to create css classes dynamically rendered -->
<div class="hidden bg-green-500  bg-red-500  bg-blue-500  bg-orange-500  bg-black"></div>