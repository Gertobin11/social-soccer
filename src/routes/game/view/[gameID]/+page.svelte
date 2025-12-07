<script lang="ts">
	import { onMount } from 'svelte';
	import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
	import Icon from '@iconify/svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	let mapElement: HTMLDivElement;
	let marker: google.maps.marker.AdvancedMarkerElement;

	onMount(async () => {
		setOptions({
			key: 'AIzaSyD-N4_aJYEE7htoSQAPugjCxfGIZZroAz0'
		});

		const { Map } = await importLibrary('maps');
		const { AdvancedMarkerElement } = await importLibrary('marker');

		// initialise the elements
		const map = new Map(mapElement, {
			center: {
				lat: Number(data.gameData.coordinates.location.coordinates[1]),
				lng: Number(data.gameData.coordinates.location.coordinates[0])
			},
			zoom: 14,
			mapId: 'create-game-map-id'
		});
		marker = new AdvancedMarkerElement({
			position: {
				lat: Number(data.gameData.coordinates.location.coordinates[1]),
				lng: Number(data.gameData.coordinates.location.coordinates[0])
			},
			map
		});
	});
</script>

<!-- A single card, displaying the game details -->
<section class="min-h-[calc(100vh-4rem)] flex items-center justify-center">
	<!-- show details of the requested game to join-->
	<div class="flex h-full items-center justify-center">
		<div class="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
			<header class="border-b border-gray-200 p-6 dark:border-gray-700">
				<h2 class="text-2xl font-bold">Game Details</h2>
			</header>

			<section class="p-6">
				<!-- Responsive Grid: 1 col on mobile, 2 cols on desktop -->
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<!-- Left Column: Key Details -->
					<div class="flex flex-col space-y-6">
						<!-- Level Chip -->
						<div>
							<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Level</span>
							<div class="ml-2 badge preset-filled-primary-500 text-lg">{data.gameData.level}</div>
						</div>

						<!-- Date & Time -->
						<div class="grid grid-cols-2 gap-4">
							<div class="flex items-start space-x-3">
								<Icon icon="mdi:date-range" width="32" height="32" class="text-primary-500" />
								<div>
									<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Day</h4>
									<p class="text-lg font-semibold">{data.gameData.day}</p>
								</div>
							</div>
							<div class="flex items-start space-x-3">
								<Icon icon="mdi:access-time" width="32" height="32" class="text-primary-500" />
								<div>
									<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h4>
									<p class="text-lg font-semibold">{data.gameData.time}</p>
								</div>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<!-- Number of PLayers-->
							<div class="flex items-start space-x-3">
								<Icon icon="mdi:user-group" width="32" height="32" class="text-primary-500" />
								<div>
									<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
										Number of Players
									</h4>
									<p class="text-lg font-semibold">{data.game.numberOfPlayers}</p>
								</div>
							</div>

							<!-- Current number of Players-->
							<div class="flex items-start space-x-3">
								<Icon
									icon="mdi:user-group-outline"
									width="32"
									height="32"
									class="text-primary-500"
								/>
								<div>
									<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
										Current Player Count
									</h4>
									<p class="text-lg font-semibold">{data.game.players.length}</p>
								</div>
							</div>
						</div>

						<!-- Address -->
						<div class="flex items-start space-x-3">
							<Icon icon="mdi:location" width="32" height="32" class="text-primary-500" />
							<div>
								<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h4>
								<address class="text-lg font-semibold not-italic">
									{data.location.lineOne}<br />
									{#if data.location.lineTwo}
										{data.location.lineTwo}<br />
									{/if}
									{data.location.city}<br />
									{data.location.county}<br />
									{data.location.country}<br />
									{data.location.eircode}
								</address>
							</div>
						</div>
					</div>

					<!-- Right Column: Map Placeholder -->
					<div class="h-64 w-full overflow-hidden rounded-lg lg:h-full">
						<div class="h-full w-full" bind:this={mapElement}></div>
					</div>
				</div>
			</section>

			<footer
				class="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 p-6 sm:flex-row dark:border-gray-700 dark:bg-gray-800/50"
			>
				<!-- Only allow new players to join -->
				{#if !data.isCurrentPlayer && !data.hasOpenRequest}
					<p class="text-center text-sm text-gray-600 sm:text-left dark:text-gray-400">
						Ready to play? Joining sends a request to the host.
					</p>
					<form method="POST" action="?/join">
						<button type="submit" class="btn flex justify-between preset-filled-primary-500">
							<Icon icon="mdi:account-add-outline" width="32" height="32" />
							Request to Join
						</button>
					</form>

					<!-- if they are currently playing in this game give them the option to quit-->
				{:else if data.isCurrentPlayer}
					<p class="text-center text-sm text-gray-600 sm:text-left dark:text-gray-400">
						You are participating in this game. Cancel?
					</p>
					<form method="POST" action="?/cancel">
						<button type="submit" class="btn flex justify-between preset-filled-error-500">
							<Icon icon="material-symbols-light:cancel-outline" width="32" height="32" />
							Cancel
						</button>
					</form>

					<!-- Show that their request is pending -->
				{:else if data.hasOpenRequest}
					<p class="text-center text-sm text-gray-600 sm:text-left dark:text-gray-400">
						You request to join is pending
					</p>
				{/if}
			</footer>
		</div>
	</div>
</section>
