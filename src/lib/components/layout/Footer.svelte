<script lang="ts">
	import type { SimulationResult } from '$lib/calculations';
	import ResultsSection from '$lib/components/sections/ResultsSection.svelte';

	const {
		monthlyCashflow,
		revenues,
		totalProjectCost,
		charges,
		simulationResult = null,
		loanAmount = 0,
		loanDuration = 20
	} = $props<{
		monthlyCashflow: number;
		revenues: number;
		totalProjectCost: number;
		charges: number;
		simulationResult?: SimulationResult | null;
		loanAmount?: number;
		loanDuration?: number;
	}>();

	let resultsModalOpen = $state(false);

	function getTrendClass(value: string): string {
		switch (value) {
			case 'positive':
				return 'text-emerald-400';
			case 'negative':
				return 'text-rose-400';
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
			<button
				type="button"
				class="rounded-lg border border-slate-600/80 bg-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-200 shadow-sm transition hover:bg-slate-600/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
				onclick={() => (resultsModalOpen = true)}
			>
				Détail des résultats
			</button>
		{/if}
	</div>
</footer>

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

