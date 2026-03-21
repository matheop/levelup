<script lang="ts">
	import type { SimulationResult } from '$lib/calculations';
	import ResultsSection from '$lib/components/sections/ResultsSection.svelte';
	import Button from '$lib/components/ui/Button.svelte';

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

	const statsBarVisible = $derived(simulationResult != null);

	let resultsModalOpen = $state(false);

	function scrollToId(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

{#if statsBarVisible}
	<footer
		id="fa-app-footer"
		class="fixed inset-x-0 bottom-0 z-10 overflow-hidden rounded-t-xl border-t border-white/10 bg-gradient-to-r from-[#00030a] to-fa-primary-container text-white shadow-[0_-8px_32px_rgba(10,29,55,0.12)]"
	>
		<div class="flex flex-col gap-4 px-5 py-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:px-8">
			<div class="flex flex-wrap items-center gap-6 md:gap-10 lg:gap-12">
				<div class="flex flex-col">
					<span class="text-[10px] font-bold tracking-wider text-[#dce9ff] uppercase">Coût total</span>
					<span class="text-lg font-extrabold text-white">
						{totalProjectCost.toLocaleString('fr-FR', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0
						})} €
					</span>
				</div>
				<div class="flex flex-col">
					<span class="text-[10px] font-bold tracking-wider text-[#dce9ff] uppercase">Revenus annuels</span>
					<span class="text-lg font-extrabold text-[#4edea3]">
						{revenues.toLocaleString('fr-FR', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0
						})} €
					</span>
				</div>
				<div class="flex flex-col">
					<span class="text-[10px] font-bold tracking-wider text-[#dce9ff] uppercase">Charges annuelles</span>
					<span class="text-lg font-extrabold text-fa-error-container">
						{charges.toLocaleString('fr-FR', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0
						})} €
					</span>
				</div>
				<div class="hidden h-10 w-px bg-white/10 md:block" aria-hidden="true"></div>
				<div
					id="fa-footer-cashflow"
					class="rounded-xl bg-fa-secondary px-5 py-2 shadow-lg md:px-6"
				>
					<span class="text-[10px] font-bold tracking-wider text-white/70 uppercase">Cash-flow mensuel</span>
					<span class="block text-xl font-black text-white">
						{monthlyCashflow.toLocaleString('fr-FR', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})} €
					</span>
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-4 md:justify-end">
				<div class="flex gap-2 md:gap-4">
					<Button
						variant="transparent"
						tone="onDark"
						size="md"
						className="!flex !h-auto !min-h-0 !w-auto !min-w-0 flex-col gap-0 !rounded-lg !p-2 !font-semibold md:!p-3"
						onClick={() => scrollToId('fa-col-project')}
					>
						{#snippet children()}
							<svg class="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
							<span class="mt-1 text-xs font-semibold">Coût</span>
						{/snippet}
					</Button>
					<Button
						variant="transparent"
						tone="onDark"
						size="md"
						className="!flex !h-auto !min-h-0 !w-auto !min-w-0 flex-col gap-0 !rounded-lg !p-2 !font-semibold md:!p-3"
						onClick={() => scrollToId('fa-col-revenue')}
					>
						{#snippet children()}
							<svg class="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
							<span class="mt-1 text-xs font-semibold">Revenus</span>
						{/snippet}
					</Button>
					<Button
						variant="transparent"
						tone="onDark"
						size="md"
						className="!flex !h-auto !min-h-0 !w-auto !min-w-0 flex-col gap-0 !rounded-lg !p-2 !font-semibold md:!p-3"
						onClick={() => scrollToId('fa-col-charges')}
					>
						{#snippet children()}
							<svg class="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m23 18-9.5-9.5-5 5L1 6"/><path d="M17 18h6v-6"/></svg>
							<span class="mt-1 text-xs font-semibold">Dépenses</span>
						{/snippet}
					</Button>
					<Button
						variant="filled"
						tone="success"
						size="md"
						className="!flex !h-auto !min-h-0 !w-auto !min-w-0 flex-col gap-0 !rounded-xl !p-2 ring-2 ring-white/20 shadow-lg md:!p-3"
						onClick={() => scrollToId('fa-footer-cashflow')}
					>
						{#snippet children()}
							<svg class="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
							<span class="mt-1 text-xs font-semibold">Cashflow</span>
						{/snippet}
					</Button>
				</div>
				{#if simulationResult}
					<Button
						variant="filled"
						tone="inverse"
						size="lg"
						label="Détail des résultats"
						className="active:translate-y-[-2px] hover:!bg-fa-surface-high"
						onClick={() => (resultsModalOpen = true)}
					/>
				{/if}
			</div>
		</div>
	</footer>
{/if}

{#if resultsModalOpen && simulationResult}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="results-modal-title"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && closeResultsModal()}
		onkeydown={(e) => e.key === 'Escape' && closeResultsModal()}
	>
		<div
			class="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-fa-outline-variant/30 bg-fa-surface-lowest shadow-2xl"
			role="document"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-fa-outline-variant/20 bg-fa-surface-low px-4 py-3">
				<h2 id="results-modal-title" class="text-lg font-semibold text-fa-primary-container">Détail des résultats</h2>
				<Button
					variant="transparent"
					tone="default"
					size="icon"
					ariaLabel="Fermer"
					className="!h-9 !w-9 !min-h-0 rounded-lg text-fa-outline hover:!bg-fa-surface-high hover:!text-fa-primary-container"
					onClick={closeResultsModal}
				>
					{#snippet children()}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					{/snippet}
				</Button>
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
