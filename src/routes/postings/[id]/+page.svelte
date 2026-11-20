<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import TextArea from '#lib/components/TextArea.svelte';
	import TextField from '#lib/components/TextField.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { form, errors, message, enhance, submitting } = superForm(untrack(() => data.form));
</script>

<svelte:head>
	<title>{data.posting.title}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="mb-4 text-2xl font-semibold">{data.posting.title}</h1>
	<p class="mb-10 whitespace-pre-line text-gray-800">{data.posting.description}</p>

	{#if data.posting.status === 'closed'}
		<p class="rounded bg-gray-100 px-4 py-3 text-gray-700">
			Diese Stelle ist geschlossen. Bewerbungen sind nicht mehr möglich.
		</p>
	{:else}
		<h2 class="mb-4 text-xl font-semibold">Jetzt bewerben</h2>
		<form method="post" use:enhance class="space-y-4" novalidate>
			{#if $message}
				<p class="rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{$message}</p>
			{/if}
			<TextField
				label="Name"
				name="name"
				autocomplete="name"
				bind:value={$form.name}
				errors={$errors.name}
			/>
			<TextField
				label="E-Mail-Adresse"
				name="email"
				type="email"
				autocomplete="email"
				bind:value={$form.email}
				errors={$errors.email}
			/>
			<TextArea
				label="Kurzer Text zu dir"
				name="coverText"
				rows={6}
				bind:value={$form.coverText}
				errors={$errors.coverText}
			/>
			<button
				disabled={$submitting}
				class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			>
				Bewerbung absenden
			</button>
		</form>
	{/if}
</main>
