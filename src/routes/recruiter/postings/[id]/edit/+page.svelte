<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance as enhanceForm } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import TextArea from '#lib/components/TextArea.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import { postingStatusLabel } from '#lib/labels.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { form, errors, enhance, submitting } = superForm(
		untrack(() => data.form),
		{
			// The status toggle reloads the page data; keep unsaved edits in the form.
			resetForm: false
		}
	);
</script>

<svelte:head>
	<title>Stelle bearbeiten</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="mb-6 text-2xl font-semibold">Stelle bearbeiten</h1>

	<section class="mb-8 flex items-center justify-between rounded border border-gray-200 px-4 py-3">
		<p>
			Status: <strong>{postingStatusLabel[data.status]}</strong>
			<span class="block text-sm text-gray-600">
				{data.status === 'open'
					? 'Die Stelle ist öffentlich sichtbar und nimmt Bewerbungen an.'
					: 'Die Stelle ist nicht öffentlich sichtbar und nimmt keine Bewerbungen an.'}
			</span>
		</p>
		<form method="post" action="?/setStatus" use:enhanceForm>
			<input type="hidden" name="status" value={data.status === 'open' ? 'closed' : 'open'} />
			<button class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
				{data.status === 'open' ? 'Stelle schließen' : 'Stelle wieder öffnen'}
			</button>
		</form>
	</section>

	<form method="post" action="?/update" use:enhance class="space-y-4" novalidate>
		<TextField label="Titel" name="title" bind:value={$form.title} errors={$errors.title} />
		<TextArea
			label="Beschreibung"
			name="description"
			rows={10}
			bind:value={$form.description}
			errors={$errors.description}
		/>
		<button
			disabled={$submitting}
			class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			Änderungen speichern
		</button>
	</form>
</main>
