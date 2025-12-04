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
	class="fixed top-0 left-0 flex h-16 w-full items-center border-b border-gray-100 bg-white px-2 py-2 shadow-sm md:px-5"
>
	<a class="group flex grow items-center text-2xl font-bold text-surface-950" href="/"
		><span class="mr-1 h-8">Social Soccer</span>
		<div class="constant-rotation flex items-center justify-center">
			<Icon icon="mingcute:football-fill" width="28" height="28" />
		</div></a
	>
	<div class="flex shrink justify-evenly gap-4 text-lg text-surface-800">
		<a class="hover:text-black hover:underline" href="/game/map">View Games</a>
		{#if data.session}
			<a class="hover:text-black hover:underline" href="/game/create">Create Game</a>
			<a class="hover:text-black hover:underline" href="/game/map/games-near-me">Games Near Me</a>
			<a class="hover:text-black hover:underline" href="/profile/dashboard">My Profile</a>
			<Logout />
		{:else}
			<a class="hover:text-black hover:underline" href="/auth/login">Login</a>
			<a class="hover:text-black hover:underline" href="/auth/register">Register</a>
		{/if}
	</div>
</nav>
<div class="mt-16 min-h-[90vh] bg-[url('/background.webp')] bg-center">
	{@render children?.()}
</div>
