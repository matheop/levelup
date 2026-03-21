<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const {
		open,
		title,
		titleId,
		onClose,
		children,
		panelClassName = '',
		maxWidthClass = 'max-w-6xl'
	} = $props<{
		open: boolean;
		title: string;
		/** Stable id for aria-labelledby */
		titleId: string;
		onClose: () => void;
		children: Snippet;
		panelClassName?: string;
		maxWidthClass?: string;
	}>();

	$effect(() => {
		if (!open) return;
		const handle = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handle);
		return () => window.removeEventListener('keydown', handle);
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby={titleId}
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && onClose()}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-fa-outline-variant/30 bg-fa-surface-lowest shadow-2xl {maxWidthClass} {panelClassName}"
			role="document"
		>
			<div
				class="flex shrink-0 items-center justify-between border-b border-fa-outline-variant/20 bg-fa-surface-low px-4 py-3"
			>
				<h2 id={titleId} class="text-lg font-semibold text-fa-primary-container">{title}</h2>
				<Button
					variant="transparent"
					tone="default"
					size="icon"
					ariaLabel="Fermer"
					className="!h-9 !w-9 !min-h-0 rounded-lg text-fa-outline hover:!bg-fa-surface-high hover:!text-fa-primary-container"
					onClick={onClose}
				>
					{#snippet children()}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					{/snippet}
				</Button>
			</div>
			<div class="min-h-0 flex-1 overflow-y-auto p-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
