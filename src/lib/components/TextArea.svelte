<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'value'> {
		label: string;
		name: string;
		value: string;
		errors?: string[];
	}

	let { label, name, value = $bindable(), errors, ...rest }: Props = $props();
</script>

<label class="block">
	<span class="mb-1 block text-sm font-medium">{label}</span>
	<textarea
		{name}
		bind:value
		aria-invalid={errors ? 'true' : undefined}
		class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none aria-invalid:border-red-500"
		{...rest}></textarea>
	{#if errors}
		<span class="mt-1 block text-sm text-red-600">{errors[0]}</span>
	{/if}
</label>
