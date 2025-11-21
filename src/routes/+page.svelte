<script lang="ts">
	import { goto } from '$app/navigation';
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
		<div class="mx-auto max-w-4xl text-center">
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
					<button class="button flex w-full items-center justify-center">Register Now </button>
				{/if}

				<button
					onclick={handleBrowseGames}
					class="alt-button flex w-full items-center justify-center"
					>{browseGameText}
				</button>
			</div>

			<div class="relative mx-auto mt-16 max-w-6xl">
				<!-- show screenshot of map in action-->
			</div>
		</div>
	</div>
</section>
