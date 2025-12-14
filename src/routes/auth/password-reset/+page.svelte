<script lang="ts">
	import {passwordResetSchema } from '$lib/validation/auth';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import type { PageProps } from './$types';
	import { setError, setMessage, superForm } from 'sveltekit-superforms/client';
	import SlidingImage from '$lib/components/ui/SlidingImage.svelte';
	import Title from '$lib/components/ui/Title.svelte';
	import MetaTags from '$lib/components/functional/MetaTags.svelte';

	let { data }: PageProps = $props();

	const { form, errors, message, constraints, enhance } = superForm(data.form, {
		validators: zod4(passwordResetSchema),
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

<MetaTags
	description="Request an email to reset your password."
	title="Social Soccer | Reset Password"
/>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-4rem)]">
    <!-- a full screen sliding image -->
	<div class="h-[calc(100vh-4rem)]">
        <!-- Photo by Oladimeji Ajegbile: https://www.pexels.com/photo/man-working-using-a-laptop-2696299/ -->
        <SlidingImage imageSrc="/password-reset.webp" />
    </div>

    <!-- the login form -->
	<div class="col-span-1 flex justify-center items-center h-full">
		<form method="POST" action="?/reset" use:enhance class="flex max-w-80 md:max-w-[400px] flex-col gap-3 shadow-xl p-8 bg-white">
            <div class="flex flex-col items-center">
				<Title title="Reset Password"></Title>
			</div>
			{#if $message}<h3>{$message}</h3>{/if}
			<label class="label">
				Email<br />
				<input
                class="input"
					name="email"
					type="email"
					aria-invalid={$errors.email ? 'true' : undefined}
					bind:value={$form.email}
					{...$constraints.email}
				/>
			</label>
			{#if $errors.email}<span class="text-error-500">{$errors.email}</span>{/if}

			<div class="flex justify-center">
				<button class="btn preset-filled-primary-500">Submit</button>
			</div>
		</form>
	</div>
</section>
