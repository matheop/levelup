<script lang="ts">
	import type { Snippet } from "svelte";

	type Variant = 'default' | 'muted' | 'success' | 'danger';

	const { title, variant = 'default', infoContent, children, footer, className = '' } = $props<{
		title: string;
		variant?: Variant;
		/** Optional info text; when set, shows a (i) icon that toggles an info panel */
		infoContent?: string;
		hasFooter?: boolean;
		children: Snippet;
		footer?: Snippet;
		className?: string;
	}>();

	let infoOpen = $state(false);

	// Success/danger: fond proche du neutre, la couleur ne vient que de l’accent et de la bordure de pied
	const variantClasses: Record<Variant, string> = {
		default: 'bg-slate-50/90 border-slate-200/90 ring-slate-200/50',
		muted: 'bg-white border-slate-200/90 ring-slate-200/40',
		success: 'bg-white border-slate-200/90 ring-slate-200/50 border-t-green-300/70',
		danger: 'bg-white border-slate-200/90 ring-slate-200/50 border-t-red-300/70'
	};

	// Bandeau haut: fin et discret pour success/danger
	const accentTopClasses: Record<Variant, string> = {
		default: 'from-slate-300/40 to-transparent',
		muted: 'from-slate-200/50 to-transparent',
		success: 'from-green-400/25 to-transparent h-6',
		danger: 'from-red-400/25 to-transparent h-6'
	};

	const footerBorderClasses: Record<Variant, string> = {
		default: 'border-slate-200/80',
		muted: 'border-slate-200/80',
		success: 'border-green-200/60',
		danger: 'border-red-200/60'
	};
</script>

<section
	class="relative flex-shrink-0 overflow-hidden rounded-xl border p-5 shadow-md ring-1 backdrop-blur-[0.5px] {variantClasses[variant as Variant]} {className}"
>
	<!-- Subtle top accent -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b {accentTopClasses[variant as Variant]}"
		aria-hidden="true"
	></div>

	<div class="relative flex items-center gap-2 mb-4">
		<h2 class="text-lg font-semibold tracking-tight text-slate-800">{title}</h2>
		{#if infoContent}
			<button
				type="button"
				class="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300/80 bg-white/80 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition shrink-0"
				aria-label="Informations"
				aria-expanded={infoOpen}
				onclick={() => (infoOpen = !infoOpen)}
			>
				<span class="text-xs font-semibold leading-none">i</span>
			</button>
		{/if}
	</div>

	{#if infoContent && infoOpen}
		<div
			class="relative mb-4 rounded-lg border border-slate-200/80 bg-white/60 p-3 text-sm text-slate-700 shadow-inner whitespace-pre-line backdrop-blur-[0.5px]"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html infoContent}
		</div>
	{/if}

	<div class="relative space-y-3">
		{@render children()}
	</div>

	{#if footer}
		<div
			class="relative mt-4 pt-3 border-t {footerBorderClasses[variant as Variant]}"
		>
			{@render footer()}
		</div>
	{/if}
</section>

