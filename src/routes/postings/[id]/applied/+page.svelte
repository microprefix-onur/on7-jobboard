<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Bewerbung gesendet</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="mb-4 text-2xl font-semibold">Danke für deine Bewerbung!</h1>
	<p class="mb-6 text-gray-700">
		Deine Bewerbung auf „{data.title}“ ist eingegangen. Der Recruiter meldet sich bei dir.
	</p>
	<a href={resolve('/')} class="text-blue-600 underline">Weitere offene Stellen</a>
</main>
