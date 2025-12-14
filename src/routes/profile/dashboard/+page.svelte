<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { PageProps } from './$types';
	import { getAverageRating, type RequestWithRelatedFields } from '$lib/client/games';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/stores';
	import { getErrorMessage } from '$lib/client/utils';
	import Title from '$lib/components/ui/Title.svelte';
	const flash = getFlash(page);

	let { data }: PageProps = $props();

	let openRequests: RequestWithRelatedFields[] = $state(data.openRequests);

	async function handleRequest(requestID: number, accepted: boolean) {
		try {
			const response = await fetch(`/game/fetch/handle-join-request`, {
				method: 'POST',
				headers: { type: 'application/json' },
				body: JSON.stringify({ requestID, accepted })
			});

			if (!response.ok) {
				throw new Error('Bad response from server');
			}

			const responseJSON = await response.json();
			if (!responseJSON.success) {
				throw new Error(`Failed to accept request with error: ${responseJSON.message}`);
			}

			$flash = { message: responseJSON.message, type: 'success' };
			openRequests = responseJSON.openRequests;
		} catch (error) {
			$flash = { message: getErrorMessage(error), type: 'error' };
		}
	}
</script>

<section class="grid h-full w-full grid-cols-3 gap-12 md:p-32">
	<div class="col-span-3 flex w-full items-center justify-center">
		<Title title="Dashboard"></Title>
	</div>

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
						{request.player.ratings && request.player.ratings.length > 0
							? getAverageRating(request.player.ratings)
							: 'Not Rated'}
					</p>

					<div class="col-span-1 flex justify-center">
						<button onclick={async () => await handleRequest(request.id, true)}
							><Icon icon="mdi:tick" width="32" height="32" class="text-success-500" /></button
						>
					</div>

					<div class="col-span-1 flex justify-center">
						<button onclick={async () => await handleRequest(request.id, false)}
							><Icon
								icon="material-symbols-light:cancel-outline"
								width="32"
								height="32"
								class="text-error-500"
							/></button
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- card for showing the player details -->
	<div class="col-span-1 flex flex-col rounded border-2 border-gray-200 bg-white p-8 shadow-2xl">
		<div class="mb-3 flex items-start gap-3">
			<Icon icon="tdesign:user" width="50" height="50" class="text-primary-500" />
			<h2 class="pt-5 text-2xl font-bold">Player Details</h2>
		</div>
		<div class="grid grid-cols-6 gap-x-4">
			<p class="col-span-2 text-sm font-medium text-gray-500">Email</p>
			<p class="col-span-4 text-lg text-black">{data.userDetails.email}</p>

			<p class="col-span-2 text-sm font-medium text-gray-500">First Name</p>
			<p class="col-span-4 text-lg text-black">{data.userDetails.firstName ?? 'Not Set'}</p>

			<p class="col-span-2 text-sm font-medium text-gray-500">Last Name</p>
			<p class="col-span-4 text-lg text-black">{data.userDetails.lastName ?? 'Not Set'}</p>

			<p class="col-span-2 text-sm font-medium text-gray-500">Email Verified?</p>
			<p class="col-span-4 flex items-end text-lg text-black">
				{data.userDetails.emailVerified ? 'yes' : 'no'}
			</p>
		</div>
		<div class="mt-3 flex justify-center">
			<a href="/profile/update-player-details" class="button-reg btn">Update</a>
		</div>
	</div>

	<!-- card for showing the users managed games -->
	<div class="col-span-2 flex flex-col rounded border-2 border-gray-200 bg-white p-8 shadow-xl">
		<div class="mb-3 flex items-center gap-3">
			<Icon
				icon="material-symbols-light:bookmark-manager-rounded"
				width="50"
				height="50"
				class="text-primary-500"
			/>
			<h2 class="pt-3 text-2xl font-bold">Manage My Games</h2>
		</div>

		{#if data.managedGames && data.managedGames.length > 0}
			<div class="flex flex-col gap-4">
				<div
					class="grid grid-cols-4 border-b border-gray-200 pb-2 text-sm font-medium text-gray-500"
				>
					<p class="col-span-1 text-start">Level</p>
					<p class="col-span-1 text-start">Day</p>
					<p class="col-span-1 text-center">Time <small> 24hr</small></p>
					<p class="col-span-1 text-center">Action</p>
				</div>

				{#each data.managedGames as game}
					<div class="grid grid-cols-4 items-center">
						<p class="col-span-1 text-start text-lg font-semibold text-black">{game.level}</p>

						<p class="col-span-1 text-start text-lg font-semibold text-black">{game.day}</p>
						<p class="col-span-1 text-center text-lg font-semibold text-black">{game.time}</p>

						<div class="col-span-1 flex justify-center text-center">
							<a href="/game/manage/{game.id}" class="alt-button-reg btn">Manage</a>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-auto flex justify-center pt-6">
				<a href="/game/create" class="button-reg btn">Create New Game</a>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center gap-2 py-10">
				<p class="text-lg font-bold text-gray-400">You haven't created any games yet.</p>
				<a href="/game/create" class="button-reg btn">Create Game</a>
			</div>
		{/if}
	</div>

	<!-- card for showing the users address -->
	<div class="col-span-1 rounded border-2 border-gray-200 bg-white p-8 shadow-xl">
		<div class="mb-3 flex items-start gap-3">
			<Icon icon="mdi:location" width="50" height="50" class="text-primary-500" />
			<h2 class="flex items-start pt-5 text-2xl font-bold">Address</h2>
		</div>
		{#if data.address}
			<div class="grid grid-cols-4 text-lg font-semibold not-italic">
				<p class="col-span-1 text-sm font-medium text-gray-500">Line One</p>
				<p class="col-span-3">{data.address.lineOne}</p>
				{#if data.address.lineTwo}
					<p class="col-span-1 text-sm font-medium text-gray-500">Line Two</p>
					<p class="col-span-3">{data.address.lineTwo}</p>
				{/if}

				<p class="col-span-1 text-sm font-medium text-gray-500">City</p>
				<p class="col-span-3">{data.address.city}</p>

				<p class="col-span-1 text-sm font-medium text-gray-500">County</p>
				<p class="col-span-3">{data.address.county}</p>

				<p class="col-span-1 text-sm font-medium text-gray-500">Country</p>
				<p class="col-span-3">{data.address.country}</p>

				<p class="col-span-1 text-sm font-medium text-gray-500">Eircode?</p>
				<p class="col-span-3">{data.address.eircode}</p>
			</div>
			<div class="mt-3 flex justify-center">
				<a href="/profile/update-address" class="button-reg btn">Update</a>
			</div>
		{:else}
			<div class="flex flex-col items-center">
				<p class="text-lg font-bold">Please add an address</p>
				<a class="button-reg btn" href="/profile/add-address">Add</a>
			</div>
		{/if}
	</div>

	<!-- card for showing the games that a user is participating in -->
	<div class="col-span-2 flex flex-col rounded border-2 border-gray-200 bg-white p-8 shadow-xl">
		<div class="mb-3 flex items-start gap-3">
			<Icon icon="mdi:calendar-check" width="50" height="50" class="text-primary-500" />
			<h2 class="pt-4 text-2xl font-bold">Games Participating</h2>
		</div>

		{#if data.gamesParticipatingIn && data.gamesParticipatingIn.length > 0}
			<div class="flex flex-col gap-4">
				<div
					class="grid grid-cols-4 border-b border-gray-200 pb-2 text-sm font-medium text-gray-500"
				>
					<p class="col-span-1 text-start">Level</p>
					<p class="col-span-1 text-start">Day</p>
					<p class="col-span-1 text-center">Time <small> 24hr</small></p>
					<p class="col-span-1 text-center">Action</p>
				</div>

				{#each data.gamesParticipatingIn as game}
					<div class="grid grid-cols-4 items-center">
						<p class="col-span-1 text-start text-lg font-semibold text-black">{game.level}</p>

						<p class="col-span-1 text-start text-lg font-semibold text-black">{game.day}</p>
						<p class="col-span-1 text-center text-lg font-semibold text-black">{game.time}</p>

						<div class="col-span-1 flex justify-center text-center">
							<a href="/game/view/{game.id}" class="alt-button-reg btn">View Details</a>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-auto flex justify-center pt-6">
				<a href="/game/map" class="button-reg btn">Find More Games</a>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center gap-2 py-10">
				<p class="text-lg font-bold text-gray-400">You haven't joined any games.</p>
				<a href="/game/map" class="preset-filled-primary-50btn button-reg btn">Browse Games</a>
			</div>
		{/if}
	</div>
</section>
