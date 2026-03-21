<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import ResultsSection from '$lib/components/sections/ResultsSection.svelte';
	import type { Project } from '$lib/domain';
	import type { SimulationResult } from '$lib/calculations';

	let { project, simulationResultsByFinancing } = $props<{
		project: Project;
		simulationResultsByFinancing: SimulationResult[];
	}>();

	let detailModalIndex = $state<number | null>(null);

	function openDetail(index: number) {
		detailModalIndex = index;
	}

	function closeDetail() {
		detailModalIndex = null;
	}

	function formatEur(value: number): string {
		return value.toLocaleString('fr-FR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function formatPct(value: number | null): string {
		if (value == null) return '–';
		return value.toLocaleString('fr-FR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}) + ' %';
	}

	function trendClass(value: number): string {
		if (value > 0) return 'text-green-600';
		if (value < 0) return 'text-red-600';
		return 'text-fa-on-surface';
	}

	function firstYearWithTax(result: SimulationResult): { year: number; amount: number } | null {
		const row = result.resultsByYear.find(
			(r) => r.gross_cashflow - r.net_cashflow > 0.01
		);
		if (!row) return null;
		return {
			year: row.year,
			amount: row.gross_cashflow - row.net_cashflow
		};
	}

	$effect(() => {
		if (detailModalIndex == null) return;
		const handle = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeDetail();
		};
		window.addEventListener('keydown', handle);
		return () => window.removeEventListener('keydown', handle);
	});
</script>

<div
	id="fa-comparison"
	class="w-full overflow-hidden rounded-2xl border border-fa-outline-variant/25 bg-fa-surface-low shadow-sm ring-1 ring-fa-outline-variant/10 scroll-mt-24"
>
	<div
		class="flex flex-col gap-3 bg-fa-primary-container px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h3 class="text-lg font-extrabold tracking-tight">Comparaison des scénarios de financement</h3>
			<p class="text-xs font-medium text-white/60">Analyse comparative sur la durée du prêt principal</p>
		</div>
		<Button
			variant="filled"
			tone="success"
			size="md"
			label="Exporter PDF"
			disabled
			title="Bientôt disponible"
			className="!opacity-40 !shadow-lg"
		/>
	</div>
	<div class="p-0">
	{#if project.financings.length === 0}
		<p class="p-6 text-sm text-fa-on-surface-variant">Aucun financement.</p>
	{:else if project.financings.length === 1}
		<p class="mb-0 px-6 pt-6 text-sm text-fa-on-surface-variant">Ajoutez un financement pour comparer les scénarios.</p>
		<div class="overflow-x-auto px-6 pb-6">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-fa-outline-variant/15 bg-fa-surface-high/40">
						<th class="py-4 pr-4 text-[10px] font-bold tracking-widest text-fa-outline uppercase">Indicateur</th>
						<th class="py-4 text-right text-[10px] font-bold tracking-widest text-fa-primary-container uppercase">Prêt 1</th>
						<th class="w-24 py-4 pl-2"></th>
					</tr>
				</thead>
				<tbody>
					{#if simulationResultsByFinancing[0]}
						{@const res = simulationResultsByFinancing[0]}
						{@const fin = project.financings[0]}
						<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
							<td class="py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant">Coût total avec intérêts (€)</td>
							<td class="py-4 text-right text-sm font-bold">{formatEur(project.getTotalCostWithInterestForFinancing(fin!))}</td>
							<td class="py-4 pl-2">
								<Button variant="outline" size="sm" label="Détail" onClick={() => openDetail(0)} />
							</td>
						</tr>
						<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
							<td class="py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant">Mensualité avec assurance (€)</td>
							<td class="py-4 text-right text-sm font-bold">{formatEur(fin!.monthlyPayment() + (fin!.loanInsuranceMonthly ?? 0))}</td>
							<td></td>
						</tr>
						<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
							<td class="py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant">Cash-flow mensuel an 1 (€)</td>
							<td class="py-4 text-right text-sm font-bold {trendClass((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}">{formatEur((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}</td>
							<td></td>
						</tr>
						<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
							<td class="py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant">Rendement net (%)</td>
							<td class="py-4 text-right text-sm font-bold">{formatPct(res.net_yield)}</td>
							<td></td>
						</tr>
						<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
							<td class="py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant">Rendement brut (%)</td>
							<td class="py-4 text-right text-sm font-bold">{formatPct(res.gross_yield)}</td>
							<td></td>
						</tr>
						<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
							<td class="py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant">TRI (%)</td>
							<td class="py-4 text-right text-sm font-bold">{formatPct(res.irr != null ? res.irr * 100 : null)}</td>
							<td></td>
						</tr>
						{#if firstYearWithTax(res)}
							<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
								<td class="py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant">Première année d'imposition</td>
								<td class="py-4 text-right text-sm font-bold">Année {firstYearWithTax(res)!.year} ({formatEur(firstYearWithTax(res)!.amount)} €)</td>
								<td></td>
							</tr>
						{/if}
					{/if}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="overflow-x-auto px-6 pb-6">
			<table class="min-w-[400px] w-full text-left text-sm">
				<thead>
					<tr class="border-b border-fa-outline-variant/15 bg-fa-surface-high/40">
						<th class="sticky left-0 bg-fa-surface-high/90 py-4 pr-4 text-[10px] font-bold tracking-widest text-fa-outline uppercase backdrop-blur-sm">Indicateur</th>
						{#each project.financings as _, i}
							<th class="whitespace-nowrap px-2 py-4 text-right text-[10px] font-bold tracking-widest text-fa-primary-container uppercase">
								Prêt {i + 1}
							</th>
						{/each}
						<th class="w-20 py-4 pl-2"></th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">Coût total avec intérêts (€)</td>
						{#each project.financings as fin, i}
							<td class="px-2 py-4 text-right text-sm font-bold">
								{formatEur(project.getTotalCostWithInterestForFinancing(fin))}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">Mensualité avec assurance (€)</td>
						{#each project.financings as fin, i}
							<td class="px-2 py-4 text-right text-sm font-bold">
								{formatEur(fin.monthlyPayment() + (fin.loanInsuranceMonthly ?? 0))}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">Cash-flow mensuel an 1 (€)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="px-2 py-4 text-right text-sm font-bold {trendClass((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}">
								{formatEur((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">Rendement net (%)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="px-2 py-4 text-right text-sm font-bold {trendClass(res.net_yield)}">
								{formatPct(res.net_yield)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">Rendement brut (%)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="px-2 py-4 text-right text-sm font-bold">
								{formatPct(res.gross_yield)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">TRI (%)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="px-2 py-4 text-right text-sm font-bold">
								{formatPct(res.irr != null ? res.irr * 100 : null)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">Première année d'imposition</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="px-2 py-4 text-right text-sm font-bold">
								{#if firstYearWithTax(res)}
									Année {firstYearWithTax(res)!.year} ({formatEur(firstYearWithTax(res)!.amount)} €)
								{:else}
									–
								{/if}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-fa-outline-variant/10 transition-colors hover:bg-fa-surface-lowest/80">
						<td class="sticky left-0 bg-fa-surface-lowest/95 py-4 pr-4 text-sm font-semibold text-fa-on-surface-variant backdrop-blur-sm">Détail</td>
						{#each project.financings as _, i}
							<td class="px-2 py-4 text-right">
								<Button variant="outline" size="sm" label="Détail" onClick={() => openDetail(i)} />
							</td>
						{/each}
						<td></td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
	</div>
</div>

{#if detailModalIndex != null && simulationResultsByFinancing[detailModalIndex] && project.financings[detailModalIndex]}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="comparison-detail-modal-title"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && closeDetail()}
		onkeydown={(e) => e.key === 'Escape' && closeDetail()}
	>
		<div
			class="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-fa-outline-variant/30 bg-fa-surface-lowest shadow-2xl"
			role="document"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-fa-outline-variant/20 bg-fa-surface-low px-4 py-3">
				<h2 id="comparison-detail-modal-title" class="text-lg font-semibold text-fa-primary-container">
					Détail – Prêt {detailModalIndex + 1}
				</h2>
				<Button
					variant="transparent"
					tone="default"
					size="icon"
					ariaLabel="Fermer"
					className="!h-9 !w-9 !min-h-0 rounded-lg text-fa-outline hover:!bg-fa-surface-high hover:!text-fa-primary-container"
					onClick={closeDetail}
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
					simulationResult={simulationResultsByFinancing[detailModalIndex]!}
					loanAmount={project.financings[detailModalIndex]!.loanAmount}
					loanDuration={project.financings[detailModalIndex]!.loanDuration}
				/>
			</div>
		</div>
	</div>
{/if}
