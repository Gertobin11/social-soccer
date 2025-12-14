<script lang="ts">
	import { page } from '$app/stores';

	export let title: string = 'Social Soccer | Find Your Next Game';
	export let description: string = 'Find a game of football, based on your location.';
	export let image: string = 'background.webp';
	export let keywords: string[] = [];

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: title,
		description: description,
		publisher: {
			'@type': 'Organization',
			name: 'Social Soccer',
			logo: {
				'@type': 'ImageObject',
				url: image
			}
		},
		image: image
	};

	const structuredJSONData = JSON.stringify(structuredData);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	{#if keywords.length}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={image} />
	<meta property="og:site_name" content="Social Soccer" />
	<meta property="og:image:alt" content={description} />

	<meta name="twitter:card" content="summary_large_image" />

	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	{@html `<script type="application/ld+json">${structuredJSONData}</script>`}
</svelte:head>
