<script lang="ts">
	import { resolve } from '$app/paths';
	import { postingStatusLabel } from '#lib/labels.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Meine Stellen</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Meine Stellen</h1>
		<a
			href={resolve('/recruiter/postings/new')}
			class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
		>
			Neue Stelle
		</a>
	</div>

	{#if data.postings.length === 0}
		<p class="text-gray-600">Du hast noch keine Stellen angelegt.</p>
	{:else}
		<ul class="divide-y divide-gray-200 rounded border border-gray-200">
			{#each data.postings as posting (posting.id)}
				<li class="flex items-center justify-between px-4 py-3">
					<a
						href={resolve('/recruiter/postings/[id]/edit', { id: posting.id })}
						class="font-medium hover:underline"
					>
						{posting.title}
					</a>
					<span
						class={[
							'rounded px-2 py-0.5 text-xs',
							posting.status === 'open'
								? 'bg-green-100 text-green-800'
								: 'bg-gray-100 text-gray-700'
						]}
					>
						{postingStatusLabel[posting.status]}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</main>
