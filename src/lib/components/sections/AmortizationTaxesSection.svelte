<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import type { Project } from '$lib/domain';
	import type { SimulationResult } from '$lib/calculations';
	import { LMNP_SUB_REGIMES } from '$lib/constants';

	let { project, simulationResult = null } = $props<{
		project: Project;
		simulationResult?: SimulationResult | null;
	}>();

	const tmiPct = $derived((project.taxes.taxBracketRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 }));
	const psPct = $derived(
		(project.taxes.socialContributionsRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
	);
	const lmnpModeLabel = $derived(
		project.lmnpSubRegime === LMNP_SUB_REGIMES.micro_bic ? 'Micro-BIC' : 'Régime réel simplifié'
	);
</script>

{#if project.taxRegime !== 'NU'}
	<SectionCard
		title="Amortissements & impôts"
		onEdit={() => modal.push('amortizationTaxes', { project, simulationResult })}
	>
		{#if project.taxRegime === 'LMNP'}
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between gap-4">
					<dt class="text-fa-on-surface-variant">Régime LMNP</dt>
					<dd class="font-semibold text-fa-primary-container">{lmnpModeLabel}</dd>
				</div>
				<div class="flex justify-between gap-4">
					<dt class="text-fa-on-surface-variant">Tranche d’imposition (TMI)</dt>
					<dd class="font-semibold text-fa-primary-container">{tmiPct} %</dd>
				</div>
				<div class="flex justify-between gap-4">
					<dt class="text-fa-on-surface-variant">Prélèvements sociaux</dt>
					<dd class="font-semibold text-fa-primary-container">{psPct} %</dd>
				</div>
			</dl>
		{:else if project.taxRegime === 'SCI_IS'}
			<p class="text-sm text-fa-on-surface-variant">
				<strong class="text-fa-primary-container">SCI à l’IS</strong> — imposition au taux société (15 % / 25 %
				selon bénéfice). Détail et saisie dans « Modifier ».
			</p>
		{/if}
	</SectionCard>
{/if}
