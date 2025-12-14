<script lang="ts">
	import MetaTags from '$lib/components/functional/MetaTags.svelte';
	import SlidingImage from '$lib/components/ui/SlidingImage.svelte';
	import Title from '$lib/components/ui/Title.svelte';
</script>

<MetaTags
	description="Verify your email on The Social Soccer Platform."
	title="Social Soccer | Verify Email"
/>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-2">
	<!-- a full screen sliding image -->
	<div class="h-full">
		<!-- unaccreddited image from https://www.pexels.com/photo/photo-of-person-wearing-neon-green-socks-3621104/ -->
		<SlidingImage imageSrc="/verified-image.webp" />
	</div>

	<!--Confirm verification div -->
	<div class="col-span-1 flex items-center justify-center">
		<div class="prose">
			<div class="flex flex-col items-center">
				<Title title="Login"></Title>
			</div>
			<p>Thank you for verifying your email. You now have full access to the site</p>

			<a href="/game/map" class="alt-button flex w-full items-center justify-center my-8"
				>Find a game
			</a>
		</div>
	</div>
</section>
