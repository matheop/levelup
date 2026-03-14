<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import type { Cost } from '$lib/domain';
	import type { ProjectType } from './sectionTypes';
	import type { TaxRegimeName } from '$lib/dbTypes';
	import { getAmortizationData } from './amortizationCalc';

	const AMORT_INFO =
		'<strong>Règles utilisées :</strong>\nPart terrain : 15 % non amortissable.\nBase bien (hors meubles) :\n- Achat : (prix d\'achat + frais de notaire) × 0,85\n- Travaux seuls : coût des travaux × 0,85\n<strong>4 postes avec durées courtes :</strong>\n- Structure / gros œuvre : 60 % de la base bien, 30 ans\n- Installations techniques : 15 % de la base bien, 15 ans\n- Agencements intérieurs : 25 % de la base bien, 10 ans\n- Meubles : 100 % du coût meubles, 5 ans';

	let { projectType, costs, taxRegime } = $props<{
		projectType: ProjectType;
		costs: Cost;
		taxRegime: TaxRegimeName;
	}>();

	const { lines: amortizationLines } = $derived(getAmortizationData(projectType, costs));
</script>

{#if taxRegime !== 'NU'}
	<SectionCard
		title="Amortissements"
		infoContent={AMORT_INFO}
		variant="success"
	>
		<div class="overflow-x-auto">
			<table class="w-full text-sm text-slate-700">
				<thead>
					<tr class="border-b border-slate-200">
						<th class="text-left py-1.5 font-medium">Poste</th>
						<th class="text-right py-1.5 font-medium">Base (€)</th>
						<th class="text-right py-1.5 font-medium">Durée</th>
						<th class="text-right py-1.5 font-medium">%</th>
						<th class="text-right py-1.5 font-medium">€/an (durée)</th>
						<th class="text-right py-1.5 font-medium">€/an (20 ans)</th>
						<th class="text-right py-1.5 font-medium">€/mois (durée)</th>
						<th class="text-right py-1.5 font-medium">€/mois (20 ans)</th>
					</tr>
				</thead>
				<tbody>
					{#each amortizationLines as line (line.label)}
						<tr class="border-b border-slate-100">
							<td class="py-1.5">{line.label}</td>
							<td class="text-right py-1.5"
								>{line.base.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td
							>
							<td class="text-right py-1.5">{line.duration} ans</td>
							<td class="text-right py-1.5">{line.percentLabel}</td>
							<td class="text-right py-1.5"
								>{line.annualOnDuration.toLocaleString('fr-FR', {
									maximumFractionDigits: 0
								})}</td
							>
							<td class="text-right py-1.5"
								>{line.annualAvg20.toLocaleString('fr-FR', {
									maximumFractionDigits: 0
								})}</td
							>
							<td class="text-right py-1.5"
								>{line.monthlyOnDuration.toLocaleString('fr-FR', {
									maximumFractionDigits: 2
								})}</td
							>
							<td class="text-right py-1.5"
								>{line.monthlyAvg20.toLocaleString('fr-FR', {
									maximumFractionDigits: 2
								})}</td
							>
						</tr>
					{/each}
					<tr class="border-t-2 border-slate-300 font-medium bg-slate-50">
						<td class="py-2">Total</td>
						<td class="text-right py-2"
							>{amortizationLines
								.reduce((s, l) => s + l.base, 0)
								.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td
						>
						<td class="text-right py-2">–</td>
						<td class="text-right py-2">–</td>
						<td class="text-right py-2"
							>{amortizationLines
								.reduce((s, l) => s + l.annualOnDuration, 0)
								.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td
						>
						<td class="text-right py-2"
							>{amortizationLines
								.reduce((s, l) => s + l.annualAvg20, 0)
								.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td
						>
						<td class="text-right py-2"
							>{amortizationLines
								.reduce((s, l) => s + l.monthlyOnDuration, 0)
								.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</td
						>
						<td class="text-right py-2"
							>{amortizationLines
								.reduce((s, l) => s + l.monthlyAvg20, 0)
								.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</td
						>
					</tr>
				</tbody>
			</table>
		</div>
	</SectionCard>
{/if}
