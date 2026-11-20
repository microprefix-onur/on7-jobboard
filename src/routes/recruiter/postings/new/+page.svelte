<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import TextArea from '#lib/components/TextArea.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { form, errors, enhance, submitting } = superForm(untrack(() => data.form));
</script>

<svelte:head>
	<title>Neue Stelle</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="mb-6 text-2xl font-semibold">Neue Stelle</h1>

	<form method="post" use:enhance class="space-y-4" novalidate>
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
			Stelle veröffentlichen
		</button>
	</form>
</main>
