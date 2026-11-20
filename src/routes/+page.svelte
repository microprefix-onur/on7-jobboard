<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Offene Stellen</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="mb-6 text-2xl font-semibold">Offene Stellen</h1>

	{#if data.postings.length === 0}
		<p class="text-gray-600">Keine offenen Stellen.</p>
	{:else}
		<ul class="divide-y divide-gray-200 rounded border border-gray-200">
			{#each data.postings as posting (posting.id)}
				<li class="px-4 py-3">
					<a
						href={resolve('/postings/[id]', { id: posting.id })}
						class="font-medium hover:underline"
					>
						{posting.title}
					</a>
					<span class="block text-sm text-gray-500">
						Veröffentlicht am {posting.createdAt.toLocaleDateString('de-DE')}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</main>
