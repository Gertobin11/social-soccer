<script lang="ts">
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { superForm } from 'sveltekit-superforms';
	const flash = getFlash(page);

	let { data }: PageProps = $props();

	const { form, errors, enhance, constraints, message } = superForm(data.profileForm, {
		resetForm: false
	});
</script>

<div class="flex items-center justify-center min-h-[90vh]">
	<div class="bg-white h-min p-8 shadow-xl md:max-w-[450px]">
		<h1 class="h1">Update Profile Details</h1>
		<form method="POST" action="?/updateUserDetails" use:enhance class="flex max-w-80 flex-col gap-3">
			{#if $message}<h3>{$message}</h3>{/if}
			<!-- First Name -->
			<label class="label block">
				First Name
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="firstName"
					type="text"
					aria-invalid={$errors.firstName ? 'true' : undefined}
					bind:value={$form.firstName}
					{...$constraints.firstName}
				/>
			</label>

			<!-- Second Name -->
			<label class="label block">
				Second Name
				<input
					class="input w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
					name="lastName"
					type="text"
					aria-invalid={$errors.lastName ? 'true' : undefined}
					bind:value={$form.lastName}
					{...$constraints.lastName}
				/>
			</label>

			<div class="my-4 flex justify-center">
				<button class="btn preset-filled-primary-500">Update</button>
			</div>
		</form>
	</div>
</div>
