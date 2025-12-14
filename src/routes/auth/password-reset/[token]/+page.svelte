<script lang="ts">
	import {newPasswordSchema} from '$lib/validation/auth';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import type { PageProps } from './$types';
	import { setError, setMessage, superForm } from 'sveltekit-superforms/client';
	import SlidingImage from '$lib/components/ui/SlidingImage.svelte';
	import Title from '$lib/components/ui/Title.svelte';
	import MetaTags from '$lib/components/functional/MetaTags.svelte';

	let { data }: PageProps = $props();

	const { form, errors, message, constraints, enhance } = superForm(data.form, {
		validators: zod4(newPasswordSchema),
		onUpdate({ form }) {
			// Form validation
			if (form.data.password.length < 8) {
				setError(form, 'password', 'Password must be 8 characters long');
			} else if (form.valid) {
				setMessage(form, 'Valid data!');
			}
		}
	});
</script>

<MetaTags
	description="Update your password on the Social Soccer Platform."
	title="Social Soccer | Update Password"
/>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-4rem)]">
    <!-- a full screen sliding image -->
	<div class="h-[calc(100vh-4rem)]">
        <!-- Photo by Robo Michalec: https://www.pexels.com/photo/referee-talking-to-a-football-player-5817858/ -->
        <SlidingImage imageSrc="/create-new-password.webp" />
    </div>

    <!-- the login form -->
	<div class="col-span-1 flex justify-center items-center h-full">
		<form method="POST" action="?/reset" use:enhance class="flex max-w-80 md:max-w-[400px] flex-col gap-3 shadow-xl p-8 bg-white">
            <div class="flex flex-col items-center">
				<Title title="Create New Password"></Title>
			</div>
			{#if $message}<h3>{$message}</h3>{/if}
			<label class="label">
				Password<br />
				<input
                class="input"
					name="password"
					type="password"
					aria-invalid={$errors.password ? 'true' : undefined}
					bind:value={$form.password}
					{...$constraints.password}
				/>
			</label>
			{#if $errors.password}<span class="text-error-500">{$errors.password}</span>{/if}

            <label class="label">
				Confirm Password<br />
				<input
                class="input"
					name="confirmPassword"
					type="password"
					aria-invalid={$errors.confirmPassword ? 'true' : undefined}
					bind:value={$form.confirmPassword}
					{...$constraints.confirmPassword}
				/>
			</label>
			{#if $errors.confirmPassword}<span class="text-error-500">{$errors.confirmPassword}</span>{/if}

			<div class="flex justify-center">
				<button class="btn preset-filled-primary-500">Submit</button>
			</div>
		</form>
	</div>
</section>
