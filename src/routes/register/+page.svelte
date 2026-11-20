<script lang="ts">
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import TextField from '#lib/components/TextField.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { form, errors, enhance, submitting } = superForm(untrack(() => data.form));
</script>

<svelte:head>
	<title>Registrieren</title>
</svelte:head>

<main class="mx-auto max-w-sm px-4 py-10">
	<h1 class="mb-6 text-2xl font-semibold">Als Recruiter registrieren</h1>

	<form method="post" use:enhance class="space-y-4" novalidate>
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
		<TextField
			label="Passwort (mindestens 8 Zeichen)"
			name="password"
			type="password"
			autocomplete="new-password"
			bind:value={$form.password}
			errors={$errors.password}
		/>
		<button
			disabled={$submitting}
			class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			Registrieren
		</button>
	</form>

	<p class="mt-6 text-sm text-gray-600">
		Schon registriert? <a href={resolve('/login')} class="text-blue-600 underline">Anmelden</a>
	</p>
</main>
