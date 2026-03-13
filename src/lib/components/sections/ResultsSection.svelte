<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import type { SimulationResult, YearResult } from '$lib/calculations';

	let { simulationResult, loanAmount = 0, loanDuration = 20 } = $props<{
		simulationResult: SimulationResult;
		loanAmount?: number;
		loanDuration?: number;
	}>();

	const chartData = $derived(simulationResult.resultsByYear.slice(0, 10));
	const maxCf = $derived(
		Math.max(...chartData.map((r: YearResult) => Math.abs(r.net_cashflow)), 1)
	);
	const firstYearNet = $derived(simulationResult.resultsByYear[0]?.net_cashflow ?? 0);
	const monthlyCashflow = $derived(firstYearNet / 12);
	const cfCumul8 = $derived(
		simulationResult.resultsByYear
			.filter((r: YearResult) => r.year <= 8)
			.reduce((s: number, r: YearResult) => s + r.net_cashflow, 0)
	);
	const targetYearEnd = $derived(loanAmount > 0 ? loanDuration : 20);
	const cfCumulEnd = $derived(
		simulationResult.resultsByYear
			.filter((r: YearResult) => r.year <= targetYearEnd)
			.reduce((s: number, r: YearResult) => s + r.net_cashflow, 0)
	);
</script>

<SectionCard title="Résultats" className="flex-shrink-0 w-full mt-4">
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
		<StatCard
			label="Rendement brut"
			value={simulationResult.gross_yield.toFixed(2) + ' %'}
			size="lg"
			trend="neutral"
		/>
		<StatCard
			label="Rendement net"
			value={simulationResult.net_yield.toFixed(2) + ' %'}
			size="lg"
			trend="neutral"
		/>
		<StatCard
			label="TRI"
			value={simulationResult.irr != null ? (simulationResult.irr * 100).toFixed(2) + ' %' : '–'}
			size="lg"
			trend="neutral"
		/>
		<StatCard
			label="Investissement total"
			value={simulationResult.total_investment.toLocaleString('fr-FR') + ' €'}
			size="lg"
			trend="neutral"
		/>
	</div>
	<div class="mb-6">
		<h3 class="text-base font-medium text-slate-700 mb-3">Le cash-flow</h3>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard
				label="Cash-flow mensuel (année 1)"
				value={monthlyCashflow.toLocaleString('fr-FR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}) + ' €'}
				size="lg"
				trend={monthlyCashflow >= 0 ? 'positive' : 'negative'}
			/>
			<StatCard
				label="Cash-flow annuel (année 1)"
				value={firstYearNet.toLocaleString('fr-FR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}) + ' €'}
				size="lg"
				trend={firstYearNet >= 0 ? 'positive' : 'negative'}
			/>
			<StatCard
				label="Cash-flow cumulé (à 8 ans)"
				sublabel="Temps moyen de possession"
				value={cfCumul8.toLocaleString('fr-FR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}) + ' €'}
				size="lg"
				trend={cfCumul8 >= 0 ? 'positive' : 'negative'}
			/>
			<StatCard
				label={loanAmount > 0 ? `Cash-flow cumulé (à ${targetYearEnd} ans)` : 'Cash-flow cumulé (à 20 ans)'}
				sublabel={loanAmount > 0 ? 'Fin de prêt' : undefined}
				value={cfCumulEnd.toLocaleString('fr-FR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}) + ' €'}
				size="lg"
				trend={cfCumulEnd >= 0 ? 'positive' : 'negative'}
			/>
		</div>
	</div>
	<div class="mb-6">
		<p class="text-sm text-slate-600 mb-2"
			>Évolution du cash-flow net (10 premières années)</p
		>
		<div class="flex gap-1 items-end h-24">
			{#each chartData as row (row.year)}
				<div class="flex-1 flex flex-col items-center gap-0.5">
					<div
						class="w-full rounded-t min-h-[2px] {row.net_cashflow >= 0
							? 'bg-emerald-500'
							: 'bg-rose-400'}"
						style="height: {Math.abs(row.net_cashflow) / maxCf * 80}px"
					></div>
					<span class="text-xs text-slate-500">{row.year}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full text-sm text-slate-700">
			<thead>
				<tr class="border-b border-slate-200">
					<th class="text-left py-2">Année</th>
					<th class="text-right py-2">Cash-flow brut (€)</th>
					<th class="text-right py-2">Cash-flow net (€)</th>
					<th class="text-right py-2">Déficit déductible (€)</th>
				</tr>
			</thead>
			<tbody>
				{#each simulationResult.resultsByYear.slice(0, 15) as row (row.year)}
					<tr class="border-b border-slate-100">
						<td class="py-2">{row.year}</td>
						<td class="text-right py-2">{row.gross_cashflow.toLocaleString('fr-FR')}</td>
						<td
							class="text-right py-2 font-medium {row.net_cashflow >= 0
								? 'text-emerald-700'
								: 'text-rose-700'}"
						>
							{row.net_cashflow.toLocaleString('fr-FR')}
						</td>
						<td class="text-right py-2"
							>{row.tax_deductible_deficit > 0
								? row.tax_deductible_deficit.toLocaleString('fr-FR')
								: '–'}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if simulationResult.resultsByYear.length > 15}
			<p class="text-slate-500 text-sm mt-2"
				>… et {simulationResult.resultsByYear.length - 15} années de plus.</p
			>
		{/if}
	</div>
</SectionCard>
