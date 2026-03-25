<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';

	type Variant = 'default' | 'success' | 'danger';

	const {
		title,
		variant = 'default',
		infoContent,
		children,
		footer,
		className = '',
		onEdit,
		editLabel = 'Modifier'
	} = $props<{
		title: string;
		variant?: Variant;
		/** Optional info text for the card title; when set, shows a (i) icon that toggles an info panel */
		infoContent?: string;
		hasFooter?: boolean;
		/** Use SectionSubtitle inside children for sub-sections (h3 + optional (i) per block) */
		children: Snippet;
		footer?: Snippet;
		className?: string;
		/** When set, shows an edit button that opens the section modal */
		onEdit?: () => void;
		editLabel?: string;
	}>();

	let infoOpen = $state(false);

	const variantClasses: Record<Variant, string> = {
		default:
			'bg-fa-surface-lowest border-fa-outline-variant/25 ring-fa-outline-variant/10 shadow-sm',
		success:
			'bg-fa-surface-lowest border-fa-outline-variant/25 ring-fa-outline-variant/15 border-t-4 border-t-fa-secondary shadow-sm',
		danger:
			'bg-fa-surface-lowest border-fa-outline-variant/25 ring-fa-outline-variant/15 border-t-4 border-t-fa-error shadow-sm'
	};

	const accentTopClasses: Record<Variant, string> = {
		default: 'from-fa-surface-high/60 to-transparent',
		success: 'from-fa-secondary/20 to-transparent h-6',
		danger: 'from-fa-error/15 to-transparent h-6'
	};

	const titleColorClasses: Record<Variant, string> = {
		default: 'text-fa-primary-container',
		success: 'text-fa-secondary',
		danger: 'text-fa-error'
	};

	const footerBorderClasses: Record<Variant, string> = {
		default: 'border-fa-outline-variant/20',
		success: 'border-fa-secondary/30',
		danger: 'border-fa-error/25'
	};
</script>

<section
	class="SectionCard-{title.replaceAll(' ', '-')} relative flex-shrink-0 overflow-hidden rounded-xl border p-6 ring-1 backdrop-blur-sm {variantClasses[variant as Variant]} {className}"
>
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b {accentTopClasses[variant as Variant]}"
		aria-hidden="true"
	></div>

	<div class="relative mb-4 flex flex-wrap items-center gap-2">
		<h2 class="min-w-0 flex-1 text-base font-bold tracking-tight {titleColorClasses[variant as Variant]}">
			{title}
		</h2>
		<div class="flex shrink-0 items-center gap-1">
			{#if onEdit}
				<Button
					variant="outline"
					tone="default"
					size="sm"
					label={editLabel}
					className="!shrink-0 !px-2 !py-1 !text-xs"
					onClick={() => onEdit()}
				/>
			{/if}
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
					<span class="text-xs font-semibold leading-none">i</span>
				</Button>
			{/if}
		</div>
	</div>

	{#if infoContent && infoOpen}
		<div
			class="relative mb-4 rounded-lg border border-fa-outline-variant/30 bg-fa-surface-lowest/80 p-3 text-sm text-fa-on-surface-variant shadow-inner whitespace-pre-line backdrop-blur-sm"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html infoContent}
		</div>
	{/if}

	<div class="relative space-y-3">
		{@render children()}
	</div>

	{#if footer}
		<div class="relative mt-4 border-t pt-3 {footerBorderClasses[variant as Variant]}">
			{@render footer()}
		</div>
	{/if}
</section>
