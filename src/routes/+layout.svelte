<script lang="ts">
	import { resolve } from '$app/paths';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="border-b border-gray-200">
	<nav class="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
		<a href={resolve('/')} class="font-semibold">Jobboard</a>
		{#if data.recruiter}
			<div class="flex items-center gap-4 text-sm">
				<a href={resolve('/recruiter')}>Meine Stellen</a>
				<form method="post" action="/logout">
					<button class="text-gray-600 hover:text-gray-900">Abmelden</button>
				</form>
			</div>
		{:else}
			<a href={resolve('/login')} class="text-sm">Für Recruiter</a>
		{/if}
	</nav>
</header>

{@render children()}
