<script lang="ts">
	import SlidingImage from '$lib/components/ui/SlidingImage.svelte';
</script>

<!-- a 2 panel layout for large screens and single column for mobiles -->
<section class="grid min-h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-2">
	<!-- a full screen sliding image -->
	<div class="h-full">
		<!-- unaccreddited image from https://www.pexels.com/photo/photo-of-person-wearing-neon-green-socks-3621104/ -->
		<SlidingImage imageSrc="/verified-image.webp" />
	</div>

	<!--COnfirm verification div -->
	<div class="col-span-1 flex items-center justify-center">
        <div class="prose">
		<h1 class="h1">Verification Successful</h1>
		<p >Thank you for verifying your email. You now have full access to the site</p>

        <!-- TODO CTA find a game -->
        </div>
	</div>
</section>
