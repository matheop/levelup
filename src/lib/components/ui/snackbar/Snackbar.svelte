<script lang="ts">
	export type SnackVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

	export interface SnackbarProps {
		title: string;
		text?: string;
		variant?: SnackVariant;
		hasCloseButton?: boolean;
		handleClose?: () => void;
	}

	let {
		text,
		variant = 'info',
		title,
		hasCloseButton = true,
		handleClose
	}: SnackbarProps = $props();

	type VariantVisual = {
		border: string;
		iconWrap: string;
		iconClass: string;
	};

	const variantVisual: Record<SnackVariant, VariantVisual> = {
		success: {
			border: 'border-fa-secondary',
			iconWrap: 'bg-fa-secondary/10',
			iconClass: 'text-fa-secondary'
		},
		danger: {
			border: 'border-fa-error',
			iconWrap: 'bg-fa-error/10',
			iconClass: 'text-fa-error'
		},
		warning: {
			border: 'border-[#E28900]',
			iconWrap: 'bg-[#E28900]/10',
			iconClass: 'text-[#E28900]'
		},
		info: {
			border: 'border-fa-primary-container',
			iconWrap: 'bg-fa-surface-high',
			iconClass: 'text-fa-primary-container'
		},
		neutral: {
			border: 'border-fa-outline',
			iconWrap: 'bg-fa-surface-low',
			iconClass: 'text-fa-outline'
		}
	};

	const visual = $derived(variantVisual[variant]);
</script>

<div
	class="group flex items-center justify-between gap-4 rounded-xl bg-fa-surface-lowest p-4 border-l-4 shadow-[0_8px_24px_-8px_rgba(10,29,55,0.12)] {visual.border}"
>
	<div class="flex min-w-0 flex-1 items-center gap-3">
		<div
			class="flex shrink-0 items-center justify-center rounded-lg p-2 {visual.iconWrap}"
			aria-hidden="true"
		>
			{#if variant === 'success'}
				<svg
					class={visual.iconClass}
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
					/>
				</svg>
			{:else if variant === 'danger'}
				<svg
					class={visual.iconClass}
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
			{:else if variant === 'warning'}
				<svg
					class={visual.iconClass}
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
				</svg>
			{:else if variant === 'info'}
				<svg
					class={visual.iconClass}
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
			{:else}
				<svg
					class={visual.iconClass}
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="9" />
					<path d="M9.5 9.5a2.5 2.5 0 0 1 4.95-.5c0 1.5-2.5 1.5-2.5 3" />
					<path d="M12 17h.01" />
				</svg>
			{/if}
		</div>
		<div>
			<p class="text-base font-bold text-fa-on-surface">{title}</p>
			{#if text}
			<p class="min-w-0 flex-1 text-sm font-medium text-fa-on-surface">{text}</p>
			{/if}
		</div>
	</div>

	{#if hasCloseButton}
		<button
			type="button"
			class="shrink-0 rounded-lg p-1 text-fa-outline opacity-40 transition-colors hover:text-fa-on-surface group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fa-primary-fixed/80 focus-visible:ring-offset-2 focus-visible:ring-offset-fa-surface-lowest"
			aria-label="Fermer"
			onclick={() => handleClose?.()}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
		</button>
	{/if}
</div>
