<script lang="ts">
	import '../app.css';
    import '../global.css'
	import favicon from '$lib/assets/favicon.svg';
	import Icon from '@iconify/svelte';

	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

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
	<div class="flex shrink justify-evenly gap-2 text-lg text-surface-800">
		{#if data.session}
			<a class="hover:text-black hover:underline" href="/">My Games</a>
		{:else}
			<a class="hover:text-black hover:underline" href="/auth/login">Login</a>
			<a class="hover:text-black hover:u`nderline" href="/auth/register">Register</a>
		{/if}
	</div>
</nav>
<div class="mt-16">
	{@render children?.()}
</div>
