<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<section class="grid h-full w-full grid-cols-3 gap-4 md:p-32">
	<div class="col-span-1 flex flex-col rounded bg-white p-8 shadow-2xl">
		<div class="mb-3 flex items-start gap-1">
			<Icon icon="tdesign:user" width="24" height="24" class="text-primary-500" />
			<h2 class="text-2xl font-bold">Player Details</h2>
		</div>
		<div class="grid grid-cols-4 gap-x-4">
			<p class="col-span-1 text-sm font-medium text-gray-500">Email</p>
			<p class="col-span-3 text-lg text-black">{data.user.email}</p>

			<p class="col-span-1 text-sm font-medium text-gray-500">First Name</p>
			<p class="col-span-3 text-lg text-black">{data.user.firstName}</p>

			<p class="col-span-1 text-sm font-medium text-gray-500">Last Name</p>
			<p class="col-span-3 text-lg text-black">{data.user.lastName}</p>

			<p class="col-span-1 text-sm font-medium text-gray-500">Email Verified?</p>
			<p class="col-span-3 text-lg text-black">
				{data.user.emailVerified ? 'yes' : 'no'}
			</p>
		</div>
		<div class="mt-3 flex justify-center">
			<a href="/profile/update-player-details" class="btn preset-filled-primary-500">Update</a>
		</div>
	</div>

	<div class="col-span-2 rounded bg-white p-8 shadow-xl">
		<h2 class="text-2xl font-bold">Manage My Games</h2>
	</div>

	<div class="col-span-1 rounded bg-white p-8 shadow-xl">
		<div class="mb-3 flex items-start gap-1">
			<Icon icon="mdi:location" width="24" height="24" class="text-primary-500" />
			<h2 class="flex h-8 items-start text-2xl font-bold">Address</h2>
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
				<a href="/profile/update-address" class="btn preset-filled-primary-500">Update</a>
			</div>
		{:else}
			<p class="text-lg font-bold">Please add an address</p>
			<a href="/profile/add-address">Add</a>
		{/if}
	</div>

	<div class="col-span-2 rounded bg-white p-8 shadow-xl">
		<h2 class="text-2xl font-bold">Games Participating</h2>
	</div>
</section>
