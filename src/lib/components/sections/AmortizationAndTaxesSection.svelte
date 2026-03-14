<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import SectionSubtitle from '$lib/components/layout/SectionSubtitle.svelte';
	import AmortizationSection from './AmortizationSection.svelte';
	import TaxesSection from './TaxesSection.svelte';
	import { AMORT_INFO } from './amortizationCalc';
	import { getTaxesInfoContent } from './taxesSectionInfo';
	import type { Project } from '$lib/domain';
	import type { SimulationResult } from '$lib/calculations';

	let { project, simulationResult = null } = $props<{
		project: Project;
		simulationResult?: SimulationResult | null;
	}>();

	const taxesInfoContent = $derived(
		getTaxesInfoContent(
			{
				taxBracketRate: project.taxes.taxBracketRate,
				socialContributionsRate: project.taxes.socialContributionsRate
			},
			project.lmnpSubRegime ?? 'reel_simplifie'
		)
	);
</script>

{#if project.taxRegime !== 'NU'}
	<SectionCard title="Amortissements & impôts">
		<SectionSubtitle title="Amortissements" infoContent={AMORT_INFO} />
		<AmortizationSection
			projectType={project.projectType}
			costs={project.cost}
			taxRegime={project.taxRegime}
			embedded
		/>
		{#if project.taxRegime === 'LMNP'}
			<SectionSubtitle
				title="Impôts et prélèvements"
				infoContent={taxesInfoContent}
				className="pt-4 border-t border-slate-200"
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
	</SectionCard>
{/if}
