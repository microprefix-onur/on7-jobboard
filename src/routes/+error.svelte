<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Fehler {page.status}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="mb-2 text-2xl font-semibold">
		{page.status === 404 ? 'Nicht gefunden' : 'Etwas ist schiefgelaufen'}
	</h1>
	<p class="mb-6 text-gray-600">
		{page.status === 404 ? 'Diese Seite gibt es nicht.' : page.error?.message}
	</p>
	<a href={resolve('/')} class="text-blue-600 underline">Zur Startseite</a>
</main>
