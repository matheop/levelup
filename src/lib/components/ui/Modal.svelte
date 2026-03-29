<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/ui/Button.svelte';

	const {
		title,
		titleId,
		onClose,
		children,
		panelClassName = '',
		maxWidthClass = 'max-w-6xl'
	} = $props<{
		title: string;
		titleId: string;
		onClose: () => void;
		children: Snippet;
		panelClassName?: string;
		maxWidthClass?: string;
	}>();

	/** Fermeture animée avant `onClose()` (démontage via la pile modale). */
	let visible = $state(true);

	function requestClose() {
		visible = false;
	}

	function handlePanelOutroEnd() {
		onClose();
	}

	$effect(() => {
		if (!visible) return;
		const handle = (e: KeyboardEvent) => {
			if (e.key === 'Escape') requestClose();
		};
		window.addEventListener('keydown', handle);
		return () => window.removeEventListener('keydown', handle);
	});
</script>

{#if visible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
		role="dialog"
		aria-modal="true"
		aria-labelledby={titleId}
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && requestClose()}
	>
		<button
			type="button"
			tabindex="-1"
			class="absolute inset-0 cursor-default border-0 bg-black/50 p-0 backdrop-blur-sm"
			aria-label="Fermer la fenêtre"
			onclick={requestClose}
		></button>
		<div
			class="relative z-[1] flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-fa-outline-variant/30 bg-fa-surface-lowest shadow-2xl {maxWidthClass} {panelClassName}"
			role="document"
			in:fly={{ y: 80, duration: 400, easing: cubicOut }}
			out:fly={{ y: 80, duration: 400, easing: cubicIn }}
			onoutroend={handlePanelOutroEnd}
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
					onClick={requestClose}
				>
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
				</Button>
			</div>
			<div class="min-h-0 flex-1 overflow-y-auto p-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
