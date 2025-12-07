<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageProps } from './$types';
	import { daysOfTheWeek } from '$lib/client/utils';
	import { Level } from '@prisma/client';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import { onMount } from 'svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	import { parseGeocodeAddress } from '$lib/client/location';
	import Title from '$lib/components/ui/Title.svelte';
	const flash = getFlash(page);

	let { data }: PageProps = $props();

	const { form, errors, enhance, constraints, message } = superForm(data.gameDetailsForm, {
		resetForm: false
	});

	let addressComplete = $state(false);

	const {
		form: addressForm,
		errors: addressErrors,
		constraints: addressConstraints,
		enhance: addressEnhance,
		message: addressMessage
	} = superForm(data.addressForm, {
		resetForm: false
	});

	$effect(() => {
		if ($addressMessage === 'Address Validated') {
			console.log($addressForm.city);
			console.log($addressForm.addressID);
			addressComplete = true;
			$addressMessage = '';
			if ($addressForm.addressID) {
				$form.addressID = $addressForm.addressID;
			}
		}
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

						$addressForm.lineOne = address.lineOne;
						$addressForm.lineTwo = address.lineTwo;
						$addressForm.city = address.city;
						$addressForm.county = address.county;
						$addressForm.country = address.country;
						$addressForm.eircode = address.eircode;

						$addressForm.longitude = lng;
						$addressForm.latitude = lat;
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
</script>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-2">
	<!-- Map section for picking the address-->
	<div class="h-full">
		<div class="h-full w-full" bind:this={mapElement}></div>
	</div>

	<!-- the address form -->
	<div class="col-span-1 flex flex-col items-center justify-center">
		<div class="col-span-1 flex flex-col items-center md:col-span-3">
			<Title title="Create a Game"></Title>
		</div>
		<div class="bg-white p-8 shadow-xl md:max-w-[450px] w-full flex flex-col items-center">
			{#if !addressComplete}
				<h2 class="py-3 text-2xl text-gray-500">Address Details</h2>
				<form
					method="POST"
					action="?/createAddress"
					use:addressEnhance
					class="flex max-w-80 flex-col gap-3 w-full"
				>
					{#if $addressMessage}<h3>{$addressMessage}</h3>{/if}
					<!-- Address Line 1-->
					<label class="label block">
						Address Line 1 *
						<input
							class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
							name="lineOne"
							type="text"
							aria-invalid={$addressErrors.lineOne ? 'true' : undefined}
							bind:value={$addressForm.lineOne}
							{...$addressConstraints.lineOne}
						/>
					</label>

					<!-- Address Line 2 -->
					<label class="label block">
						Address Line 2 *
						<input
							class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
							name="lineTwo"
							type="text"
							aria-invalid={$addressErrors.lineTwo ? 'true' : undefined}
							bind:value={$addressForm.lineTwo}
							{...$addressConstraints.lineTwo}
						/>
					</label>

					<!-- City -->
					<label class="label block">
						City / Town *
						<input
							class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
							name="city"
							type="text"
							aria-invalid={$addressErrors.city ? 'true' : undefined}
							bind:value={$addressForm.city}
							{...$addressConstraints.city}
						/>
					</label>

					<!-- County -->
					<label class="label block">
						County *
						<input
							class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
							name="county"
							type="text"
							aria-invalid={$addressErrors.county ? 'true' : undefined}
							bind:value={$addressForm.county}
							{...$addressConstraints.county}
						/>
					</label>

					<!-- Eircode -->
					<label class="label block">
						Eircode *
						<input
							class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
							name="eircode"
							type="text"
							aria-invalid={$addressErrors.eircode ? 'true' : undefined}
							bind:value={$addressForm.eircode}
							{...$addressConstraints.eircode}
						/>
					</label>

					<!-- Country -->
					<label class="label block">
						Country *
						<input
							class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
							name="country"
							type="text"
							aria-invalid={$addressErrors.country ? 'true' : undefined}
							bind:value={$addressForm.country}
							{...$addressConstraints.country}
						/>
					</label>

					<!-- hidden input for address id -->
					<input
						name="addressID"
						type="hidden"
						aria-invalid={$addressErrors.addressID ? 'true' : undefined}
						bind:value={$addressForm.addressID}
						{...$addressConstraints.addressID}
					/>

					<!-- hidden input for latitude -->
					<input
						name="latitude"
						type="hidden"
						aria-invalid={$addressErrors.latitude ? 'true' : undefined}
						bind:value={$addressForm.latitude}
						{...$addressConstraints.latitude}
					/>

					<!-- hidden input for longitude -->
					<input
						name="longitude"
						type="hidden"
						aria-invalid={$addressErrors.longitude ? 'true' : undefined}
						bind:value={$addressForm.longitude}
						{...$addressConstraints.longitude}
					/>

					<div class="my-4 flex justify-center">
						<button class="btn preset-filled-primary-500">Continue</button>
					</div>
				</form>
			{:else}
				<h2 class="py-3 text-2xl text-gray-500">Game Details</h2>
				<form method="POST" action="?/createGame" use:enhance class="flex max-w-80 flex-col gap-3 w-full">
					{#if $message}<h3>{$message}</h3>{/if}

					<!-- Day -->
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

					<!-- Time -->
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

					<!-- Level -->
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

					<!-- Number of Players -->
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

					<!-- hidden input for address id in the create game form -->
					<input
						name="addressID"
						type="hidden"
						aria-invalid={$errors.addressID ? 'true' : undefined}
						bind:value={$form.addressID}
						{...$constraints.addressID}
					/>

					<div class="my-4 flex justify-center gap-3">
						<button
							type="button"
							onclick={() => (addressComplete = false)}
							class="btn preset-filled-error-500">Back</button
						>
						<button type="submit" class="btn preset-filled-primary-500">Create</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>
