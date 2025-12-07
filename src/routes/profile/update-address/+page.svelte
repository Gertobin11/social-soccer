<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
	import { parseGeocodeAddress } from '$lib/client/location';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	const flash = getFlash(page);

	let { data }: PageProps = $props();

	const { form, errors, enhance, constraints, message } = superForm(data.addressForm, {
		resetForm: false
	});
	let mapElement: HTMLDivElement;
	let marker: google.maps.marker.AdvancedMarkerElement;

	onMount(async () => {
		try {
			setOptions({
				key: data.googleMapAPIKey
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

						$form.longitude = lng;
						$form.latitude = lat;
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
	<div class="col-span-1 flex items-center justify-center">
		<div class="bg-white p-8 shadow-xl md:max-w-[450px]">
			<h1 class="h1">Update Address</h1>
			<h2 class="py-3 h2 text-gray-500">Address Details</h2>
			<form method="POST" action="?/createAddress" use:enhance class="flex max-w-80 flex-col gap-3">
				{#if $message}<h3>{$message}</h3>{/if}
				<!-- Address Line 1-->
				<label class="label block">
					Address Line 1 *
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
					Address Line 2 *
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
					County *
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
					Eircode *
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

				<!-- hidden input for address id -->
				<input
					name="addressID"
					type="hidden"
					aria-invalid={$errors.addressID ? 'true' : undefined}
					bind:value={$form.addressID}
					{...$constraints.addressID}
				/>

				<!-- hidden input for latitude -->
				<input
					name="latitude"
					type="hidden"
					aria-invalid={$errors.latitude ? 'true' : undefined}
					bind:value={$form.latitude}
					{...$constraints.latitude}
				/>

				<!-- hidden input for longitude -->
				<input
					name="longitude"
					type="hidden"
					aria-invalid={$errors.longitude ? 'true' : undefined}
					bind:value={$form.longitude}
					{...$constraints.longitude}
				/>

				<div class="my-4 flex justify-center">
					<button class="btn preset-filled-primary-500">Update</button>
				</div>
			</form>
		</div>
	</div>
</section>
