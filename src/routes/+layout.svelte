<script lang="ts">
	import '../app.css';
	import '../global.css';
	import favicon from '$lib/assets/favicon.svg';
	import Icon from '@iconify/svelte';

	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';

	const flash = getFlash(page);

	import type { LayoutProps } from './$types';
	import Logout from '$lib/components/functional/Logout.svelte';

	import { onNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';

	// add natively supported page transitions
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let isMobileMenuOpen = $state(false);

	// Function to toggle the mobile menu state.
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Function to close the mobile menu, useful for link clicks or closing via the overlay.
	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- hidden form for logging out users-->
<form class="hidden" action="/?/logout" id="logout_form" method="POST"></form>

<!-- create toast to show messages from the server-->
{#if $flash}
	<div class="absolute flex w-full justify-center p-2 md:justify-end">
		<div
			class={`${$flash.type === 'success' ? '  border-b-4 border-success-500' : 'border-b-4 border-error-500'} flex w-full justify-between rounded-xl bg-white p-4 shadow-xl md:w-64`}
		>
			<p>{$flash.message}</p>
			<button onclick={() => ($flash = undefined)}>X</button>
		</div>
	</div>
{/if}

<!-- Main navigation for the top of the page-->
<nav
	class="fixed top-0 left-0 z-50 flex h-16 w-full items-center border-b border-gray-100 bg-white px-2 py-2 shadow-sm md:px-5"
>
	<a class="group flex grow items-center font-bold text-surface-950 lg:text-2xl" href="/"
		><span class="mr-1 h-4 lg:h-8">Social Soccer</span>
		<div class="constant-rotation flex items-center justify-center">
			<Icon icon="mingcute:football-fill" width="28" height="28" />
		</div></a
	>
	<div class="hidden shrink items-center justify-evenly gap-4 text-surface-800 md:flex lg:text-lg">
		<a class="hover:text-black hover:underline" href="/game/map">View Games</a>
		{#if data.session}
			<a class="hover:text-black hover:underline" href="/game/create">Create Game</a>
			<a class="hover:text-black hover:underline" href="/game/map/games-near-me">Games Near Me</a>
			<a class="hover:text-black hover:underline" href="/profile/dashboard">Dashboard</a>
			<Logout />
		{:else}
			<a class="hover:text-black hover:underline" href="/auth/login">Login</a>
			<a class="hover:text-black hover:underline" href="/auth/register">Register</a>
		{/if}
	</div>
	<div class="md:hidden">
		<button
			onclick={toggleMobileMenu}
			aria-label="Open main menu"
			class="inline-flex items-center justify-center rounded-md p-2 text-primary-100 hover:bg-gray-200"
		>
			<!-- Conditionally render burger or close icon -->
			{#if !isMobileMenuOpen}
				<!-- Burger Icon -->
				<svg
					class="h-6 w-6 text-primary-500"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16m-7 6h7"
					/>
				</svg>
			{:else}
				<!-- Close Icon (X) -->
				<svg
					class="h-6 w-6 text-error-500"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{/if}
		</button>
	</div>
</nav>

<!-- Mobile Menu -->
{#if isMobileMenuOpen}
	<div
		transition:fade={{ duration: 200 }}
		class="fixed top-0 right-0 z-40 h-[100vh] w-[100vw] !bg-surface-50 p-5 shadow-xl md:hidden"
	>
		<div class="flex h-full w-full flex-col space-y-4 pt-12">
			<a
				onclick={closeMobileMenu}
				href="/game/map"
				class="title block rounded-md px-3 py-2 text-xl font-medium text-black hover:text-slate-700"
				>View Games</a
			>

			{#if data.session}
				<a
					onclick={closeMobileMenu}
					href="/game/create"
					class="title block rounded-md px-3 py-2 text-xl font-medium text-black hover:text-slate-700"
					>Create Game</a
				>
				<a
					onclick={closeMobileMenu}
					href="/game/map/games-near-me"
					class="title block rounded-md px-3 py-2 text-xl font-medium text-black hover:text-slate-700"
					>Games Near Me</a
				>
				<a
					onclick={closeMobileMenu}
					href="/profile/dashboard"
					class="title block rounded-md px-3 py-2 text-xl font-medium text-black hover:text-slate-700"
					>Dashboard</a
				>
				<Logout />
			{:else}
				<a
					onclick={closeMobileMenu}
					href="/auth/login"
					class="title block rounded-md px-3 py-2 text-xl font-medium text-black hover:text-slate-700"
					>Login</a
				>
				<a
					onclick={closeMobileMenu}
					href="/auth/register"
					class="title block rounded-md px-3 py-2 text-xl font-medium text-black hover:text-slate-700"
					>Register</a
				>
			{/if}
		</div>
	</div>
{/if}

<div class="mt-16 min-h-[90vh] bg-[url('/background.webp')] bg-center">
	{@render children?.()}
</div>
