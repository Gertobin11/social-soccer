<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageProps } from './$types';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { createGameSchema } from '$lib/validation/game';
	import { daysOfTheWeek } from '$lib/client/utils';
	import { Level } from '@prisma/client';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import { onMount } from 'svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	import { parseGeocodeAddress } from '$lib/client/location';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	const flash = getFlash(page);

	let { data }: PageProps = $props();

	const { form, errors, message, constraints, enhance } = superForm(data.form, {
		validators: zod4(createGameSchema)
	});

	let mapElement: HTMLDivElement;
	let marker: google.maps.marker.AdvancedMarkerElement;

	onMount(async () => {
		try {
			setOptions({
				key: 'AIzaSyD-N4_aJYEE7htoSQAPugjCxfGIZZroAz0'
			});

			// import the class for the map, marker and location lookup
			const { Map } = await importLibrary('maps');
			const { AdvancedMarkerElement } = await importLibrary('marker');
			const { Geocoder } = await importLibrary('geocoding');

			// initialise the elements
			const map = new Map(mapElement, {
				center: { lat: 53.397, lng: -8.0 },
				zoom: 7.5,
				mapId: 'create-game-map-id'
			});

			marker = new AdvancedMarkerElement({
				map,
				position: { lat: 52.2713096, lng: -9.6999325 }
			});

			const geocoder = new Geocoder();

			// Add an on click event to get the address of the users click
			map.addListener('click', async (mapsMouseEvent: { latLng: any }) => {
				const latLng = mapsMouseEvent.latLng;
				const lat = latLng.lat();
				const lng = latLng.lng();

				marker.position = latLng;

				try {
					const response = await geocoder.geocode({ location: latLng });

					if (response.results && response.results.length > 0) {
						// The address is in the 'formatted_address' field of the first result
						const address = parseGeocodeAddress(response.results[0].address_components);
						$form.lineOne = address.lineOne;
						$form.lineTwo = address.lineTwo;
						$form.city = address.city;
						$form.county = address.county;
						$form.country = address.country;
						$form.eircode = address.eircode;

						for (let value of Object.values($form)) {
							console.log(value);
						}

						openState = true;
					} else {
						console.log('No address results found.');
					}
				} catch (error) {
					console.error('Geocoder failed due to:', error);
				}
			});
		} catch (error) {
			console.log(error);
			$flash = {
				type: 'error',
				message: 'Unable to load map, please check the google api is allowed by your browser'
			};
		}
	});

	let openState = $state(false);

	function modalClose() {
		openState = false;
	}
</script>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-2">
	<!-- Map section for picking the address-->
	<div class="h-full">
		<div class="h-full w-full" bind:this={mapElement}></div>
	</div>

	<!-- the create game form -->
	<div class="col-span-1 flex items-center justify-center">
		<form
			method="POST"
			action="?/create"
			use:enhance
			class="flex max-w-80 flex-col gap-3 bg-white p-8 shadow-xl md:max-w-[400px]"
		>
			<h1 class="h1">Create a Game</h1>
			{#if $message}<h3>{$message}</h3>{/if}

			<label class="label">
				Day<br />
				<select
					class="input"
					name="day"
					aria-invalid={$errors.day ? 'true' : undefined}
					bind:value={$form.day}
					{...$constraints.day}
				>
					{#each daysOfTheWeek as day}
						<option value={day}>{day}</option>
					{/each}
				</select>
			</label>

			<label class="label">
				Time<br />
				<input
					class="input"
					name="time"
					type="time"
					aria-invalid={$errors.time ? 'true' : undefined}
					bind:value={$form.time}
					{...$constraints.time}
				/>
			</label>
			{#if $errors.time}<span class="text-error-500">{$errors.time}</span>{/if}

			<label class="label">
				Level<br />
				<select
					class="input"
					name="level"
					aria-invalid={$errors.level ? 'true' : undefined}
					bind:value={$form.level}
					{...$constraints.level}
				>
					{#each Object.values(Level) as level}
						<option value={level}>{level}</option>
					{/each}
				</select>
			</label>
			{#if $errors.level}<span class="text-error-500">{$errors.level}</span>{/if}

			<label class="label">
				No. of PLayers<br />
				<input
					class="input"
					name="numberOfPlayers"
					type="number"
					aria-invalid={$errors.numberOfPlayers ? 'true' : undefined}
					bind:value={$form.numberOfPlayers}
					{...$constraints.numberOfPlayers}
				/>
			</label>
			{#if $errors.numberOfPlayers}<span class="text-error-500">{$errors.numberOfPlayers}</span
				>{/if}

			<div class="my-4 flex justify-center">
				<button class="btn preset-filled-primary-500">Submit</button>
			</div>
			<div class="flex w-full justify-end">
				<a class="text-surface-600 underline hover:text-surface-400" href="/auth/password-reset"
					>Forgot Password?</a
				>
			</div>
		</form>
	</div>
</section>

<!-- Modal for confirming the address generated from the reverse geo lookup-->
<Modal
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet trigger()}Open Modal{/snippet}
	{#snippet content()}
		<header class="flex justify-between">
			<h2 class="h2">Modal Example</h2>
		</header>
		<div>
			<label class="label block">
				Address Line 1
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="lineOne"
					type="text"
					aria-invalid={$errors.lineOne ? 'true' : undefined}
					bind:value={$form.lineOne}
					{...$constraints.lineOne}
				/>
			</label>

			<!-- Address Line 2 -->
			<label class="label block">
				Address Line 2 (Apt, Suite, etc.)
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="lineTwo"
					type="text"
					aria-invalid={$errors.lineTwo ? 'true' : undefined}
					bind:value={$form.lineTwo}
					{...$constraints.lineTwo}
				/>
			</label>

			<!-- City -->
			<label class="label block">
				City / Town *
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="city"
					type="text"
					aria-invalid={$errors.city ? 'true' : undefined}
					bind:value={$form.city}
					{...$constraints.city}
				/>
			</label>

			<!-- County -->
			<label class="label block">
				County
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="county"
					type="text"
					aria-invalid={$errors.county ? 'true' : undefined}
					bind:value={$form.county}
					{...$constraints.county}
				/>
			</label>

			<!-- Eircode -->
			<label class="label block">
				Eircode / Postal Code
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="eircode"
					type="text"
					aria-invalid={$errors.eircode ? 'true' : undefined}
					bind:value={$form.eircode}
					{...$constraints.eircode}
				/>
			</label>

			<!-- Country -->
			<label class="label block">
				Country *
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="country"
					type="text"
					aria-invalid={$errors.country ? 'true' : undefined}
					bind:value={$form.country}
					{...$constraints.country}
				/>
			</label>
		</div>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={modalClose}>Cancel</button>
			<button type="button" class="btn preset-filled" onclick={modalClose}>Confirm</button>
		</footer>
	{/snippet}
</Modal>
