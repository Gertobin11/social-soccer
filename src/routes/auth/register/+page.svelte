<script lang="ts">
	import { signupSchema } from '$lib/validation/auth';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import type { PageProps } from './$types';
	import { setError, setMessage, superForm } from 'sveltekit-superforms/client';
	import SlidingImage from '$lib/components/ui/SlidingImage.svelte';
	import Title from '$lib/components/ui/Title.svelte';

	let { data }: PageProps = $props();

	const { form, errors, message, constraints, enhance } = superForm(data.form, {
		validators: zod4(signupSchema),
		onUpdate({ form }) {
			// Form validation
			if (!form.data.email.includes('@')) {
				setError(form, 'email', 'Malformed email address.');
			} else if (form.valid) {
				setMessage(form, 'Valid data!');
			}
		}
	});
</script>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-2">
	<!-- a full screen sliding image -->
	<div class="h-full">
		<!-- Photo by  Anastasia  Shuraeva: https://www.pexels.com/photo/women-taking-a-group-photo-9517923/-->
		<SlidingImage imageSrc="/registration-image.webp" />
	</div>

	<!-- the registration form -->
	<div class="col-span-1 flex items-center justify-center">
		<form
			method="POST"
			action="?/register"
			use:enhance
			class="flex max-w-80 flex-col gap-3 bg-white p-8 shadow-xl md:max-w-[400px]"
		>
			<div class="flex flex-col items-center">
				<Title title="Register"></Title>
			</div>
			{#if $message}<h3>{$message}</h3>{/if}
			<label class="label">
				Email
				<input
					type="email"
					class="input"
					name="email"
					aria-invalid={$errors.email ? 'true' : undefined}
					bind:value={$form.email}
					{...$constraints.email}
				/>
			</label>
			{#if $errors.email}<span class="text-error-500">{$errors.email}</span>{/if}

			<label class="label">
				Password
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
					type="password"
					class="input"
					name="confirmPassword"
					aria-invalid={$errors.confirmPassword ? 'true' : undefined}
					bind:value={$form.confirmPassword}
					{...$constraints.confirmPassword}
				/>
			</label>
			{#if $errors.confirmPassword}<span class="text-error-500">{$errors.confirmPassword}</span
				>{/if}

			<div class="flex justify-center">
				<button class="btn button-reg">Submit</button>
			</div>
		</form>
	</div>
</section>
