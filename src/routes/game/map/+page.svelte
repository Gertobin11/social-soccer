<script lang="ts">
	import { page } from '$app/state';
	import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
	import { onMount } from 'svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import type { PageProps } from './$types';
	import * as MarkerClusterer from '@googlemaps/markerclusterer';
	import Icon from '@iconify/svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { filterGameSchema } from '$lib/validation/game';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { daysOfTheWeek } from '$lib/client/utils';
	import { createMarkers  } from '$lib/client/games';
	import Title from '$lib/components/ui/Title.svelte';
	import { Level } from '$lib/client/prismaEnumTranslation';
	import MetaTags from '$lib/components/functional/MetaTags.svelte';
	const flash = getFlash(page);

	let { data }: PageProps = $props();

	const { form, errors, message, constraints, enhance } = superForm(data.form, {
		validators: zod4(filterGameSchema)
	});
	// make currentGameData reactive for filtering and searching
	let currentGameData = $state(data.gameDataArray);

	let numberOfPlayerOptions = [8, 9, 10, 11, 12, 13, 14];

	let mapElement: HTMLDivElement;
	let legendElement: HTMLDivElement;

	let map: google.maps.Map;
	let markers: google.maps.marker.AdvancedMarkerElement[] = $state([]);
	let cluster: MarkerClusterer.MarkerClusterer;
	let infoWindow: google.maps.InfoWindow;

	async function handleFilter(event: SubmitEvent) {
		event.preventDefault();
		try {
			let response = await fetch('/game/fetch/filter-games', {
				method: 'POST',
				body: JSON.stringify({ form: $form })
			});

			if (!response.ok) {
				throw new Error('Bad response from server');
			}

			const responseJSON = await response.json();
			if (!responseJSON.success) {
				throw new Error('Unable to filter results');
			}

			// update the map with the data retuned from the filter
			cluster.removeMarkers(markers);
			currentGameData = responseJSON.gameDataArray;
			markers = await createMarkers(currentGameData, map, infoWindow, data.loggedIn);
			cluster.addMarkers(markers);
		} catch (error) {
			$flash = { type: 'error', message: 'Unable to filter results' };
		}
	}

	onMount(async () => {
		try {
			setOptions({
				key: data.googleMapAPIKey
			});

			// import the class for the map AND marker
			const { Map } = await importLibrary('maps');

			// initialise the elements
			map = new Map(mapElement, {
				center: { lat: 53.397, lng: -8.0 },
				zoom: 7.5,
				mapId: 'create-game-map-id'
			});

			const position = google.maps.ControlPosition.RIGHT_BOTTOM;

			map.controls[position].push(legendElement);

			infoWindow = new google.maps.InfoWindow({
				content: '',
				disableAutoPan: true
			});

			markers = await createMarkers(currentGameData, map, infoWindow, data.loggedIn);

			// Add a marker clusterer to manage the markers.
			cluster = new MarkerClusterer.MarkerClusterer({ markers, map });
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
	description="Use our interactive map to see the location of games"
	title="Social Soccer | View Games"
/>

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

	<!-- Card for interacting with the map-->
	<div class="col-span-1 flex flex-col gap-12 items-center justify-center">
        	<div class="flex flex-col items-center">
		<Title title="View Games"></Title>
	</div>
		<div class="w-full max-w-[400px] rounded border-2 border-gray-200 bg-white p-8 shadow-xl">
			<h3 class="h3">Filter Results</h3>
			<form class="flex flex-col gap-3" onsubmit={handleFilter}>
				<!-- select element for day -->
				<label class="label">
					<span> Day </span>
					<select
						class="select"
						name="day"
						aria-invalid={$errors.day ? 'true' : undefined}
						bind:value={$form.day}
						{...$constraints.day}
					>
						<option selected value={undefined}>Any</option>
						{#each daysOfTheWeek as day}
							<option value={day}>{day}</option>
						{/each}</select
					>
				</label>

				<!-- select element for level -->
				<label class="label">
					<span> Level </span>
					<select
						class="select"
						name="level"
						aria-invalid={$errors.level ? 'true' : undefined}
						bind:value={$form.level}
						{...$constraints.level}
					>
						<option selected value={undefined}>Any</option>
						{#each Object.values(Level) as level}
							<option value={level}>{level}</option>
						{/each}</select
					>
				</label>

				<!-- select element for number of players -->
				<label class="label">
					<span> Number of Players </span>
					<select
						class="select"
						name="numberOfPlayers"
						aria-invalid={$errors.numberOfPlayers ? 'true' : undefined}
						bind:value={$form.numberOfPlayers}
						{...$constraints.numberOfPlayers}
					>
						<option selected value={undefined}>Any</option>
						{#each numberOfPlayerOptions as option}
							<option value={option}>{option}</option>
						{/each}</select
					>
				</label>

				<button type="submit" class="button-reg btn">Filter</button>
			</form>
		</div>
	</div>
</section>
