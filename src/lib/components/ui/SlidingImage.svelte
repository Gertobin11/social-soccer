<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let cover: HTMLDivElement;

	let { imageSrc }: { imageSrc: string } = $props();

	onMount(() => {
		const timer = setTimeout(() => {
			cover.classList.add('translate-x-full');
		}, 10);
		return () => clearTimeout(timer);
	});

	onDestroy(() => {
		if (cover) {
			cover.classList.remove('translate-x-full');
		}
	});
</script>

<div class="relative w-full overflow-hidden md:h-full">
	<img src={imageSrc} alt="wedding themed page banner" fetchpriority="high" class="h-full w-full object-cover" />

	<div
		class="absolute top-0 left-0 h-full w-full bg-surface-50 transition-transform duration-700 ease-in-out"
		bind:this={cover}
	></div>
</div>