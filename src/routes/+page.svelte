<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let browseGameText = $state('Browse Games');

	async function handleBrowseGames() {
		browseGameText = 'Loading Map...';
		await goto('/game/map');
	}
</script>

<!-- Hero Section -->
<section class="pt-32 pb-20 lg:pt-48 lg:pb-32">
	<div class="relative container mx-auto px-6">
		<div class="mx-auto mb-12 max-w-4xl text-center">
			<h1 class="mb-6 text-5xl leading-tight font-bold text-surface-950 md:text-7xl">
				Join the game, <br />
				<span class="text-gradient">find your community</span>
			</h1>

			<p class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-medium text-surface-700">
				The complete platform for managing 5-a-side matches and connecting with local players.
				Whether you're organizing a weekly kickabout or looking to meet people in a new city, sport
				starts here.
			</p>

			<div class="flex flex-col items-center justify-center gap-6 sm:flex-row">
				<!-- only show the register button to non logged in users -->
				{#if !data.session}
					<a href="/auth/register" class="button flex w-full items-center justify-center"
						>Register Now
					</a>
				{/if}

				<button
					onclick={handleBrowseGames}
					class="alt-button flex w-full items-center justify-center"
					>{browseGameText}
				</button>
			</div>
		</div>

		<!-- 3 pillars of how the application can help people -->
		<div class="mx-auto mt-28 grid max-w-6xl grid-cols-1 md:grid-cols-3">
			<div class="flex flex-col items-center justify-center gap-8">
				<Icon
					class="text-primary-500"
					icon="material-symbols-light:map-search-outline-rounded"
					width="96"
					height="96"
				/>
				<h3 class="text-center h3">Find Games in your Locality</h3>
			</div>
			<div class="flex flex-col items-center justify-center gap-8">
				<Icon
					class="text-primary-500"
					icon="fluent:people-team-add-20-regular"
					width="96"
					height="96"
				/>
				<h3 class="text-center h3">Seamlessly Join any Game</h3>
			</div>
			<div class="flex flex-col items-center justify-center gap-8">
				<Icon
					class="text-primary-500"
					icon="streamline-ultimate:workflow-teamwork-user-high-five"
					width="96"
					height="96"
				/>
				<h3 class="text-center h3">Become Part of the Team</h3>
			</div>
		</div>

        <!-- Example of the map -->
		<div class="mx-auto mt-28 max-w-6xl">
			<div class="flex flex-col items-center justify-center gap-8">
				<h2 class="h2">Easy to use Interactive Map</h2>

				<p class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-medium text-surface-700">
					Make Geospatial Queries with the click of a button. Find Games based on your location.
					Filter games by day, level or how many players
				</p>

				<div class="rounded shadow-xl">
					<img
						class="w-full object-cover"
						src="map-screenshot.webp"
						alt="screenshot from google maps"
					/>
				</div>
			</div>
		</div>
	</div>
</section>
