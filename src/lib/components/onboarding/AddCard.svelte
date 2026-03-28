<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		title,
		subtitle,
		actionLabel = 'Ajouter',
		onadd,
		icon
	} = $props<{
		title: string;
		subtitle?: string;
		actionLabel?: string;
		onadd: () => void;
		icon?: Snippet;
	}>();
</script>

<div
	class="AddCard flex flex-col gap-4 rounded-xl border-2 border-dashed border-fa-outline-variant/35 bg-fa-surface-low/40 p-6 sm:flex-row sm:items-center sm:justify-between"
>
	<div class="flex items-start gap-4">
		{#if icon}
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-full bg-fa-surface-high text-fa-outline"
			>
				{@render icon()}
			</div>
		{/if}
		<div>
			<p class="font-bold text-fa-primary-container">{title}</p>
			{#if subtitle}
				<p class="mt-0.5 text-xs text-fa-outline">{subtitle}</p>
			{/if}
		</div>
	</div>
	<Button
		variant="outline"
		tone="default"
		size="md"
		className="!shrink-0 !rounded-lg !font-bold"
		label={actionLabel}
		onClick={onadd}
	/>
</div>
