<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		children,
		onBack,
		onForward,
		backDisabled = false,
		forwardDisabled = false,
		forwardLabel,
		showBack = true
	} = $props<{
		children: Snippet;
		onBack: () => void;
		onForward: () => void;
		backDisabled?: boolean;
		forwardDisabled?: boolean;
		forwardLabel: string;
		showBack?: boolean;
	}>();
</script>

<header
	class="Shell_Header fixed top-0 left-0 z-50 w-full border-b border-fa-outline-variant/15 bg-fa-surface/95 backdrop-blur-md"
>
	<div class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
		<a
			href={resolve('/')}
			class="text-xl font-extrabold tracking-tight text-fa-primary-container no-underline hover:opacity-90"
		>
			Financial Architect
		</a>
		<nav class="flex items-center gap-2 sm:gap-3" aria-label="Compte">
			<a
				href={resolve('/auth')}
				class="rounded-lg px-3 py-2 text-sm font-bold text-fa-primary-container no-underline hover:bg-fa-surface-high"
			>
				Connexion
			</a>
			<a
				href="{resolve('/auth')}?mode=signup"
				class="rounded-lg bg-fa-primary-container px-3 py-2 text-sm font-bold text-white no-underline shadow-sm hover:opacity-95"
			>
				Inscription
			</a>
		</nav>
	</div>
</header>

<div class="Shell_Content min-h-screen pt-24 pb-36">
	{@render children()}
</div>

<footer
	class="Shell_Footer fixed bottom-0 left-0 z-40 w-full border-t border-fa-outline-variant/15 bg-fa-surface-lowest/90 backdrop-blur-xl"
>
	<div
		class="mx-auto flex max-w-6xl flex-col items-stretch gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
	>
		{#if showBack}
			<Button
				variant="transparent"
				tone="default"
				size="lg"
				disabled={backDisabled}
				className="!order-2 !justify-center md:!order-1 md:!justify-start"
				onClick={onBack}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
					class="shrink-0"
				>
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				<span>Précédent</span>
			</Button>
		{:else}
			<div class="hidden md:order-1 md:block"></div>
		{/if}

		<div class="order-1 flex w-full md:order-2 md:w-auto md:justify-end">
			<Button
				variant="filled"
				tone="default"
				size="xl"
				disabled={forwardDisabled}
				className="!w-full md:!w-auto"
				onClick={onForward}
			>
				<span>{forwardLabel}</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
					class="shrink-0"
				>
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</Button>
		</div>
	</div>
</footer>
