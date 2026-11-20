<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { applicationStatuses } from '#lib/schemas/application.ts';
	import { applicationStatusLabel, postingStatusLabel } from '#lib/labels.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Bewerbungen: {data.posting.title}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold">{data.posting.title}</h1>
			<p class="text-sm text-gray-600">Status: {postingStatusLabel[data.posting.status]}</p>
		</div>
		<a
			href={resolve('/recruiter/postings/[id]/edit', { id: data.posting.id })}
			class="text-sm text-blue-600 hover:underline"
		>
			Bearbeiten
		</a>
	</div>

	<h2 class="mb-4 text-xl font-semibold">Bewerbungen</h2>

	{#if data.applications.length === 0}
		<p class="text-gray-600">Für diese Stelle gibt es noch keine Bewerbungen.</p>
	{:else}
		<ul class="space-y-4">
			{#each data.applications as application (application.id)}
				<li class="rounded border border-gray-200 px-4 py-3">
					<div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
						<div>
							<span class="font-medium">{application.applicantName}</span>
							<a
								href={`mailto:${application.applicantEmail}`}
								class="ml-2 text-sm text-blue-600 hover:underline"
							>
								{application.applicantEmail}
							</a>
						</div>
						<span class="text-sm text-gray-500">
							{application.createdAt.toLocaleString('de-DE', {
								dateStyle: 'medium',
								timeStyle: 'short',
								timeZone: 'Europe/Berlin'
							})}
						</span>
					</div>
					<p class="mb-3 whitespace-pre-line text-gray-800">{application.coverText}</p>
					<form method="post" action="?/setStatus" use:enhance class="flex items-center gap-2">
						<input type="hidden" name="applicationId" value={application.id} />
						<label class="text-sm">
							Status
							<select
								name="status"
								value={application.status}
								class="ml-1 rounded border border-gray-300 px-2 py-1"
							>
								{#each applicationStatuses as status (status)}
									<option value={status}>{applicationStatusLabel[status]}</option>
								{/each}
							</select>
						</label>
						<button class="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
							Speichern
						</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}
</main>
