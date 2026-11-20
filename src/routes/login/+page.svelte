<script lang="ts">
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import TextField from '#lib/components/TextField.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { form, errors, message, enhance, submitting } = superForm(untrack(() => data.form));
</script>

<svelte:head>
	<title>Anmelden</title>
</svelte:head>

<main class="mx-auto max-w-sm px-4 py-10">
	<h1 class="mb-6 text-2xl font-semibold">Anmelden</h1>

	<form method="post" use:enhance class="space-y-4" novalidate>
		{#if $message}
			<p class="rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{$message}</p>
		{/if}
		<TextField
			label="E-Mail-Adresse"
			name="email"
			type="email"
			autocomplete="email"
			bind:value={$form.email}
			errors={$errors.email}
		/>
		<TextField
			label="Passwort"
			name="password"
			type="password"
			autocomplete="current-password"
			bind:value={$form.password}
			errors={$errors.password}
		/>
		<button
			disabled={$submitting}
			class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			Anmelden
		</button>
	</form>

	<p class="mt-6 text-sm text-gray-600">
		Noch kein Konto? <a href={resolve('/register')} class="text-blue-600 underline">Registrieren</a>
	</p>
</main>
