<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'info' | 'success' | 'danger' | 'warning';

	let {
		variant = 'default',
		className = '',
		children
	} = $props<{
		variant?: Variant;
		className?: string;
		children: Snippet;
	}>();

	const shellClasses: Record<Variant, string> = {
		default: 'bg-fa-surface-high/50 ring-fa-outline-variant/20',
		info: 'bg-fa-primary-fixed/35 ring-fa-primary-fixed/40',
		success: 'bg-fa-secondary-container/25 ring-fa-secondary/30',
		warning: 'bg-amber-50 ring-amber-200/70',
		danger: 'bg-fa-error-container/70 ring-fa-error/25'
	};

	const iconClasses: Record<Variant, string> = {
		default: 'text-fa-primary-container',
		info: 'text-fa-primary-container',
		success: 'text-fa-on-secondary-container',
		warning: 'text-amber-900',
		danger: 'text-fa-error'
	};

	const textClasses: Record<Variant, string> = {
		default: 'text-fa-on-surface-variant',
		info: 'text-fa-on-surface-variant',
		success: 'text-fa-on-surface-variant',
		warning: 'text-amber-950',
		danger: 'text-fa-on-surface-variant'
	};

	const mergedShell = $derived(
		`InfoBanner flex gap-4 rounded-xl p-6 ring-1 backdrop-blur-sm ${shellClasses[variant as Variant]} ${className}`.trim()
	);
	const mergedIcon = $derived(iconClasses[variant as Variant]);
	const mergedText = $derived(textClasses[variant as Variant]);
</script>

<div class={mergedShell} role="note">
	<span class="mt-0.5 shrink-0 {mergedIcon}" aria-hidden="true">
		{#if variant === 'success'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
				/>
			</svg>
		{:else if variant === 'warning'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
			</svg>
		{:else if variant === 'danger'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
				/>
			</svg>
		{:else}
			<!-- default + info : i dans un cercle -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
				/>
			</svg>
		{/if}
	</span>
	<div class="text-sm leading-relaxed {mergedText}">
		{@render children()}
	</div>
</div>
