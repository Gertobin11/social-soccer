<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<section class="grid h-full w-full grid-cols-3 gap-4 md:p-32">
	<div class="col-span-1 flex flex-col rounded bg-white p-8 shadow-xl">
		<h2 class="text-2xl font-bold">Player Details</h2>
		<ul>
			<li>
				<p class="text-lg text-black">
					<span class="mr-4 text-sm font-medium text-gray-500">Email</span>{data.user.email}
				</p>
			</li>
			<li>
				<p class="text-lg text-black">
					<span class="mr-4 text-sm font-medium text-gray-500">First Name</span>{data.user
						.firstName}
				</p>
			</li>
			<li>
				<p class="text-lg text-black">
					<span class="mr-4 text-sm font-medium text-gray-500">Last Name</span>{data.user.lastName}
				</p>
			</li>
			<li>
				<p class="text-lg text-black">
					<span class="mr-4 text-sm font-medium text-gray-500">Email Verified?</span>{data.user
						.emailVerified
						? 'yes'
						: 'no'}
				</p>
			</li>
		</ul>
		<div class="mt-3 flex justify-center">
			<a href="/profile/update-player-details" class="btn preset-filled-primary-500">Update</a>
		</div>
	</div>

	<div class="col-span-2 rounded bg-white p-8 shadow-xl">
		<h2 class="text-2xl font-bold">Manage My Games</h2>
	</div>

	<div class="col-span-1 rounded bg-white p-8 shadow-xl">
		<h2 class="text-2xl font-bold">Address</h2>
		{#if data.address}
			<address class="text-lg font-semibold not-italic">
				<span class="mr-4 text-sm font-medium text-gray-500">Line One</span>{data.address
					.lineOne}<br />
				{#if data.address.lineTwo}
					<span class="mr-4 text-sm font-medium text-gray-500">Line Two</span>{data.address
						.lineTwo}<br />
				{/if}
				<span class="mr-4 text-sm font-medium text-gray-500">City</span>{data.address.city}<br />
				<span class="mr-4 text-sm font-medium text-gray-500">County</span>{data.address.county}<br
				/>
				<span class="mr-4 text-sm font-medium text-gray-500">Country</span>{data.address.country}<br
				/>
				<span class="mr-4 text-sm font-medium text-gray-500">Eircode?</span>{data.address.eircode}
			</address>
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
