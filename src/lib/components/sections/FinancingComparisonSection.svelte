<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
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
		return 'text-slate-700';
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

<SectionCard title="Comparatif des financements" className="w-full">
	{#if project.financings.length === 0}
		<p class="text-sm text-slate-600">Aucun financement.</p>
	{:else if project.financings.length === 1}
		<p class="text-sm text-slate-600 mb-4">Ajoutez un financement pour comparer les scénarios.</p>
		<div class="overflow-x-auto">
			<table class="w-full text-sm text-left">
				<thead>
					<tr class="border-b border-slate-200">
						<th class="py-2 pr-4 font-medium text-slate-700">Indicateur</th>
						<th class="py-2 text-right font-medium text-slate-700">Prêt 1</th>
						<th class="py-2 pl-2 w-24"></th>
					</tr>
				</thead>
				<tbody>
					{#if simulationResultsByFinancing[0]}
						{@const res = simulationResultsByFinancing[0]}
						{@const fin = project.financings[0]}
						<tr class="border-b border-slate-100">
							<td class="py-2 pr-4 text-slate-600">Coût total avec intérêts (€)</td>
							<td class="py-2 text-right font-medium">{formatEur(project.getTotalCostWithInterestForFinancing(fin!))}</td>
							<td class="py-2 pl-2">
								<Button variant="outline" size="sm" label="Détail" onClick={() => openDetail(0)} />
							</td>
						</tr>
						<tr class="border-b border-slate-100">
							<td class="py-2 pr-4 text-slate-600">Mensualité avec assurance (€)</td>
							<td class="py-2 text-right font-medium">{formatEur(fin!.monthlyPayment() + (fin!.loanInsuranceMonthly ?? 0))}</td>
							<td></td>
						</tr>
						<tr class="border-b border-slate-100">
							<td class="py-2 pr-4 text-slate-600">Cash-flow mensuel an 1 (€)</td>
							<td class="py-2 text-right font-medium {trendClass((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}">{formatEur((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}</td>
							<td></td>
						</tr>
						<tr class="border-b border-slate-100">
							<td class="py-2 pr-4 text-slate-600">Rendement net (%)</td>
							<td class="py-2 text-right font-medium">{formatPct(res.net_yield)}</td>
							<td></td>
						</tr>
						<tr class="border-b border-slate-100">
							<td class="py-2 pr-4 text-slate-600">Rendement brut (%)</td>
							<td class="py-2 text-right font-medium">{formatPct(res.gross_yield)}</td>
							<td></td>
						</tr>
						<tr class="border-b border-slate-100">
							<td class="py-2 pr-4 text-slate-600">TRI (%)</td>
							<td class="py-2 text-right font-medium">{formatPct(res.irr != null ? res.irr * 100 : null)}</td>
							<td></td>
						</tr>
						{#if firstYearWithTax(res)}
							<tr class="border-b border-slate-100">
								<td class="py-2 pr-4 text-slate-600">Première année d'imposition</td>
								<td class="py-2 text-right font-medium">Année {firstYearWithTax(res)!.year} ({formatEur(firstYearWithTax(res)!.amount)} €)</td>
								<td></td>
							</tr>
						{/if}
					{/if}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="overflow-x-auto -mx-1">
			<table class="w-full min-w-[400px] text-sm text-left">
				<thead>
					<tr class="border-b border-slate-200">
						<th class="py-2 pr-4 font-medium text-slate-700 sticky left-0 bg-white">Indicateur</th>
						{#each project.financings as _, i}
							<th class="py-2 px-2 text-right font-medium text-slate-700 whitespace-nowrap">
								Prêt {i + 1}
							</th>
						{/each}
						<th class="py-2 pl-2 w-20"></th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">Coût total avec intérêts (€)</td>
						{#each project.financings as fin, i}
							<td class="py-2 px-2 text-right font-medium">
								{formatEur(project.getTotalCostWithInterestForFinancing(fin))}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">Mensualité avec assurance (€)</td>
						{#each project.financings as fin, i}
							<td class="py-2 px-2 text-right font-medium">
								{formatEur(fin.monthlyPayment() + (fin.loanInsuranceMonthly ?? 0))}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">Cash-flow mensuel an 1 (€)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="py-2 px-2 text-right font-medium {trendClass((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}">
								{formatEur((res.resultsByYear[0]?.net_cashflow ?? 0) / 12)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">Rendement net (%)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="py-2 px-2 text-right font-medium {trendClass(res.net_yield)}">
								{formatPct(res.net_yield)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">Rendement brut (%)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="py-2 px-2 text-right font-medium">
								{formatPct(res.gross_yield)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">TRI (%)</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="py-2 px-2 text-right font-medium">
								{formatPct(res.irr != null ? res.irr * 100 : null)}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">Première année d'imposition</td>
						{#each simulationResultsByFinancing as res, i}
							<td class="py-2 px-2 text-right font-medium">
								{#if firstYearWithTax(res)}
									Année {firstYearWithTax(res)!.year} ({formatEur(firstYearWithTax(res)!.amount)} €)
								{:else}
									–
								{/if}
							</td>
						{/each}
						<td></td>
					</tr>
					<tr class="border-b border-slate-100">
						<td class="py-2 pr-4 text-slate-600 sticky left-0 bg-slate-50/80">Détail</td>
						{#each project.financings as _, i}
							<td class="py-2 px-2 text-right">
								<Button variant="outline" size="sm" label="Détail" onClick={() => openDetail(i)} />
							</td>
						{/each}
						<td></td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</SectionCard>

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
			class="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
			role="document"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
				<h2 id="comparison-detail-modal-title" class="text-lg font-semibold text-slate-800">
					Détail – Prêt {detailModalIndex + 1}
				</h2>
				<button
					type="button"
					class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline focus-visible:ring-2 focus-visible:ring-slate-400"
					aria-label="Fermer"
					onclick={closeDetail}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
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
