<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	const { title, infoContent, className = '' } = $props<{
		title: string;
		/** Optional info text; when set, shows a (i) icon that toggles an info panel */
		infoContent?: string;
		/** Optional class for the wrapper (e.g. pt-4 border-t border-fa-outline-variant/20) */
		className?: string;
	}>();

	let infoOpen = $state(false);
</script>

<div class="flex flex-col {className}">
	<div class="mb-2 flex items-center gap-2">
		<h3 class="text-sm font-semibold text-fa-on-surface-variant">{title}</h3>
		{#if infoContent}
			<Button
				variant="outline"
				tone="default"
				size="icon"
				ariaLabel="Informations"
				ariaExpanded={infoOpen}
				className="!inline-flex !size-5 !min-h-0 !min-w-0 shrink-0 !rounded-full !border-fa-outline-variant/60 !bg-fa-surface-lowest/90 !p-0 text-fa-outline shadow-sm hover:!bg-fa-surface-high hover:!text-fa-primary-container"
				onClick={() => (infoOpen = !infoOpen)}
			>
				{#snippet children()}
					<span class="text-xs font-semibold leading-none">i</span>
				{/snippet}
			</Button>
		{/if}
	</div>

	{#if infoContent && infoOpen}
		<div
			class="mb-3 rounded-lg border border-fa-outline-variant/30 bg-fa-surface-lowest/80 p-3 text-sm text-fa-on-surface-variant shadow-inner whitespace-pre-line backdrop-blur-sm"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html infoContent}
		</div>
	{/if}
</div>
