<script lang="ts">
	import { getAverageRating, type RequestWithRelatedFields } from '$lib/client/games';
	import { getErrorMessage } from '$lib/client/utils';
	import type { PageProps } from './$types';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	const flash = getFlash(page);

	let { data }: PageProps = $props();

	let openRequests: RequestWithRelatedFields[] = $state(data.openRequests);
</script>

<section class="grid h-full w-full grid-cols-3 gap-12 md:p-32">
	<!-- Show requests first as it is the most urgent information -->
	{#if openRequests && openRequests.length > 0}
		<div class="col-span-3 flex flex-col rounded border-2 border-gray-200 bg-white p-8 shadow-2xl">
			<div class="col-span-3 mb-3 flex items-start gap-3">
				<Icon icon="mdi:invite" width="50" height="50" class="text-primary-500" />
				<h2 class="pt-4 text-2xl font-bold">Open Requests</h2>
			</div>
			<div
				class="grid grid-cols-12 border-b border-gray-200 pb-2 text-sm font-medium text-gray-500"
			>
				<p class="col-span-2 text-start">Level</p>
				<p class="col-span-2 text-start">Day</p>
				<p class="col-span-2 text-center">Time <small> 24hr</small></p>
				<p class="col-span-2 text-center">Player</p>
				<p class="col-span-2 text-center">Rating</p>
				<p class="col-span-1 text-center">Accept</p>
				<p class="col-span-1 text-center">Decline</p>
			</div>

			{#each openRequests as request}
				<div class="mt-3 grid grid-cols-12 items-center">
					<p class="col-span-2 text-start text-lg font-semibold text-black">{request.game.level}</p>
					<p class="col-span-2 text-start text-lg font-semibold text-black">{request.game.day}</p>
					<p class="col-span-2 text-center text-lg font-semibold text-black">{request.game.time}</p>
					<p class="col-span-2 text-start text-lg font-semibold text-black">
						{request.player.email}
					</p>
					<p class="col-span-2 text-center text-lg font-semibold text-black">
						{request.player.ratings.length > 0
							? getAverageRating(request.player.ratings)
							: 'Not Rated'}
					</p>

					<div class="col-span-1 flex justify-center">
						<form action="?/accept" method="POST">
							<input type="hidden" name="requestID" value={request.id} />
							<button type="submit"
								><Icon icon="mdi:tick" width="32" height="32" class="text-success-500" /></button
							>
						</form>
					</div>

					<div class="col-span-1 flex justify-center">
						<form action="?/reject" method="POST">
							<input type="hidden" name="requestID" value={request.id} />
							<button type="submit"
								><Icon
									icon="material-symbols-light:cancel-outline"
									width="32"
									height="32"
									class="text-error-500"
								/></button
							>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
