<script lang="ts">
	import type { SimulationResult } from '$lib/calculations';
	import Button from '$lib/components/ui/Button.svelte';
	import ResultsSection from '$lib/components/sections/ResultsSection.svelte';

	type PersistDockProps = {
		visible: boolean;
		isPersisted: boolean;
		hasUnsavedChanges: boolean;
		onSave: () => void | Promise<void>;
		onDelete: () => void | Promise<void>;
		persisting: boolean;
	};

	const {
		monthlyCashflow,
		revenues,
		totalProjectCost,
		charges,
		simulationResult = null,
		loanAmount = 0,
		loanDuration = 20,
		persistDock = null
	} = $props<{
		monthlyCashflow: number;
		revenues: number;
		totalProjectCost: number;
		charges: number;
		simulationResult?: SimulationResult | null;
		loanAmount?: number;
		loanDuration?: number;
		persistDock?: PersistDockProps | null;
	}>();

	const statsBarVisible = $derived(simulationResult != null);
	const dockBottomClass = $derived(
		statsBarVisible ? 'bottom-[6.25rem] md:bottom-[6.5rem]' : 'bottom-5'
	);

	let resultsModalOpen = $state(false);

	function getTrendClass(value: string): string {
		switch (value) {
			case 'positive':
				return 'text-green-400';
			case 'negative':
				return 'text-red-400';
			default:
				return 'text-white';
		}
	}

	function closeResultsModal() {
		resultsModalOpen = false;
	}

	$effect(() => {
		if (!resultsModalOpen) return;
		const handle = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeResultsModal();
		};
		window.addEventListener('keydown', handle);
		return () => window.removeEventListener('keydown', handle);
	});
</script>

{#snippet stats(title: string, value: number, trend?: 'positive' | 'negative' | 'neutral')}
	{@const trendClass = trend ? getTrendClass(trend) : getTrendClass(value >= 0 ? 'positive' : 'negative')}
	<div class="text-center">
		<p class="text-slate-400 text-sm">{title}</p>
		<p class="text-lg font-semibold tracking-tight {trendClass}">
			{value.toLocaleString('fr-FR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})} €
		</p>
	</div>
{/snippet}

{#if statsBarVisible}
<footer
	class="fixed inset-x-0 bottom-0 z-10 overflow-hidden rounded-t-xl border-t border-slate-700/50 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-white shadow-lg ring-1 ring-slate-700/50 ring-t-0 backdrop-blur-sm"
>
	<!-- Subtle grid pattern (same as header) -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px); background-size: 24px 24px;"
		aria-hidden="true"
	></div>

	<div class="relative flex flex-wrap items-center justify-center gap-4 py-4 px-5 md:gap-6 md:px-6">
		{@render stats('Coût total du projet', totalProjectCost, 'neutral')}
		<span class="size-1 rounded-full bg-slate-500 hidden shrink-0 md:inline" aria-hidden="true"></span>
		{@render stats('Revenus annuels', revenues, 'positive')}
		<span class="size-1 rounded-full bg-slate-500 hidden shrink-0 md:inline" aria-hidden="true"></span>
		{@render stats('Charges annuelles', charges, 'negative')}
		<span class="size-1 rounded-full bg-slate-500 hidden shrink-0 md:inline" aria-hidden="true"></span>
		{@render stats('Cash-flow mensuel (an 1)', monthlyCashflow)}
		{#if simulationResult}
			<span class="size-1 rounded-full bg-slate-500 hidden shrink-0 md:inline" aria-hidden="true"></span>
			<Button variant="filled" label="Détail des résultats" onClick={() => (resultsModalOpen = true)} />
		{/if}
	</div>
</footer>
{/if}

{#if persistDock?.visible}
	<div
		class="pointer-events-none fixed right-4 z-30 flex flex-col items-end gap-2 {dockBottomClass}"
		aria-live="polite"
	>
		<div
			class="pointer-events-auto flex max-w-[min(100vw-2rem,20rem)] flex-col gap-2 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/60 backdrop-blur-md sm:flex-row sm:items-center"
		>
			{#if persistDock.hasUnsavedChanges}
				{#if persistDock.isPersisted}
					<Button
						variant="filled"
						label="Enregistrer les modifications"
						disabled={persistDock.persisting}
						onClick={() => persistDock?.onSave()}
					/>
				{:else}
					<Button
						variant="filled"
						tone="success"
						label="Sauvegarder le projet"
						disabled={persistDock.persisting}
						onClick={() => persistDock?.onSave()}
					/>
				{/if}
			{/if}
			{#if persistDock.isPersisted}
				<Button
					variant="outline"
					tone="danger"
					label="Supprimer"
					disabled={persistDock.persisting}
					onClick={() => persistDock?.onDelete()}
				/>
			{/if}
		</div>
	</div>
{/if}

{#if resultsModalOpen && simulationResult}
	<!-- Modal overlay -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="results-modal-title"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && closeResultsModal()}
		onkeydown={(e) => e.key === 'Escape' && closeResultsModal()}
	>
		<div
			class="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
			role="document"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
				<h2 id="results-modal-title" class="text-lg font-semibold text-slate-800">Détail des résultats</h2>
				<button
					type="button"
					class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
					aria-label="Fermer"
					onclick={closeResultsModal}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>
			<div class="min-h-0 flex-1 overflow-y-auto p-4">
				<ResultsSection
					simulationResult={simulationResult}
					{loanAmount}
					{loanDuration}
				/>
			</div>
		</div>
	</div>
{/if}

