<script lang="ts">
	let { title }: { title: string } = $props();
</script>

<h1
	class="relative mb-6 inline-block text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl mt-6"
>
	<span class="relative z-10">{title}</span>
	<span class="absolute bottom-1 left-0 -z-0 h-3 w-full -skew-x-6 bg-green-400/30"></span>
</h1>
