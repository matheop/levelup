<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import SectionSubtitle from '$lib/components/layout/SectionSubtitle.svelte';
	import AppModal from '$lib/components/ui/AppModal.svelte';
	import AmortizationSection from './AmortizationSection.svelte';
	import TaxesSection from './TaxesSection.svelte';
	import { getAmortizationInfoContent } from './amortizationCalc';
	import { getTaxesInfoContent } from './taxesSectionInfo';
	import type { Project } from '$lib/domain';
	import type { SimulationResult } from '$lib/calculations';
	import { LMNP_SUB_REGIMES } from '$lib/constants';

	let { project, simulationResult = null } = $props<{
		project: Project;
		simulationResult?: SimulationResult | null;
	}>();

	let modalOpen = $state(false);

	const taxesInfoContent = $derived(
		getTaxesInfoContent(
			project.taxes,
			project.lmnpSubRegime ?? LMNP_SUB_REGIMES.reel_simplifie,
			project.taxRegime
		)
	);
	const amortInfoContent = $derived(getAmortizationInfoContent(project.taxRegime));

	const tmiPct = $derived((project.taxes.taxBracketRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 }));
	const psPct = $derived(
		(project.taxes.socialContributionsRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
	);
	const lmnpModeLabel = $derived(
		project.lmnpSubRegime === LMNP_SUB_REGIMES.micro_bic ? 'Micro-BIC' : 'Régime réel simplifié'
	);
</script>

{#if project.taxRegime !== 'NU'}
	<SectionCard title="Amortissements & impôts" onEdit={() => (modalOpen = true)}>
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

	<AppModal
		open={modalOpen}
		title="Amortissements & impôts — édition"
		titleId="modal-amort-taxes-title"
		onClose={() => (modalOpen = false)}
	>
		<SectionSubtitle title="Amortissements" infoContent={amortInfoContent} />
		<AmortizationSection
			projectType={project.projectType}
			costs={project.cost}
			taxRegime={project.taxRegime}
			embedded
		/>
		{#if project.taxRegime === 'LMNP' || project.taxRegime === 'SCI_IS'}
			<SectionSubtitle
				title="Impôts et prélèvements"
				infoContent={taxesInfoContent}
				className="border-t border-fa-outline-variant/20 pt-4"
			/>
			<TaxesSection
				taxes={project.taxes}
				taxRegime={project.taxRegime}
				lmnpSubRegime={project.lmnpSubRegime}
				annualRevenueAfterVacancy={project.annualRevenueAfterVacancy}
				{simulationResult}
				embedded
			/>
		{/if}
	</AppModal>
{/if}
