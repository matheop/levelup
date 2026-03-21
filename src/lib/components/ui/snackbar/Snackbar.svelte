<script lang="ts">
	import type { SnackItem, SnackVariant } from './snackbarQueue.svelte.ts';
	import Button from '$lib/components/ui/Button.svelte';

	const { item, showClose, onDismiss } = $props<{
		item: SnackItem;
		/** Affiche le bouton X (toujours `true` si fermeture uniquement manuelle). */
		showClose: boolean;
		onDismiss: () => void;
	}>();

	const variantClasses: Record<SnackItem['variant'], string> = {
		info: 'border-fa-primary-fixed/80 bg-fa-surface-high text-fa-primary-container ring-fa-primary-fixed/30',
		success: 'border-emerald-300/80 bg-emerald-50 text-emerald-900 ring-emerald-200/60',
		warning: 'border-amber-300/80 bg-amber-50 text-amber-950 ring-amber-200/60',
		danger: 'border-red-300/80 bg-red-50 text-red-950 ring-red-200/60'
	};

	const variantClass = $derived(variantClasses[item.variant as SnackVariant]);
</script>

<div
	class="flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ring-1 backdrop-blur-sm {variantClass}"
	role="status"
	aria-live="polite"
>
	<p class="min-w-0 flex-1 text-sm font-medium leading-snug">{item.message}</p>
	{#if showClose}
		<Button
			variant="transparent"
			tone="default"
			size="icon"
			ariaLabel="Fermer"
			className="!h-8 !w-8 !min-h-0 shrink-0 rounded-lg !text-current opacity-70 hover:!bg-black/5 hover:!opacity-100"
			onClick={onDismiss}
		>
			{#snippet children()}
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			{/snippet}
		</Button>
	{/if}
</div>
