<script lang="ts">
	import { loginSchema } from '$lib/validation/auth';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import type { PageProps } from './$types';
	import { setError, setMessage, superForm } from 'sveltekit-superforms/client';
	import SlidingImage from '$lib/components/ui/SlidingImage.svelte';

	let { data }: PageProps = $props();

	const { form, errors, message, constraints, enhance } = superForm(data.form, {
		validators: zod4(loginSchema),
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
<section class="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-4rem)]">
    <!-- a full screen sliding image -->
	<div class="h-full">
        <!-- Photo by RF._.studio _: https://www.pexels.com/photo/photo-of-person-wearing-neon-green-socks-3621104/ -->
        <SlidingImage imageSrc="/login-image.webp" />
    </div>

    <!-- the login form -->
	<div class="col-span-1 flex justify-center items-center">
		<form method="POST" use:enhance class="flex max-w-80 md:max-w-[400px] flex-col gap-3 shadow-xl p-8 bg-white">
            <h1 class="h1">Log In</h1>
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

			<div class="flex justify-center">
				<button class="btn preset-filled-primary-500">Submit</button>
			</div>
		</form>
	</div>
</section>
