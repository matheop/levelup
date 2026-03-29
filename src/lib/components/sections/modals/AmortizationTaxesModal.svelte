<script lang="ts">
	import SectionSubtitle from '$lib/components/layout/SectionSubtitle.svelte';
	import AmortizationSection from '$lib/components/sections/AmortizationSection.svelte';
	import TaxesSection from '$lib/components/sections/TaxesSection.svelte';
	import { getAmortizationInfoContent } from '$lib/components/sections/amortizationCalc';
	import { getTaxesInfoContent } from '$lib/components/sections/taxesSectionInfo';
	import type { SimulationResult } from '$lib/calculations';
	import { LMNP_SUB_REGIMES } from '$lib/constants';
	import type { Project } from '$lib/domain';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { project, simulationResult = null, onClose } = $props<{
		project: Project;
		simulationResult?: SimulationResult | null;
		onClose: () => void;
	}>();

	const taxesInfoContent = $derived(
		getTaxesInfoContent(
			project.taxes,
			project.lmnpSubRegime ?? LMNP_SUB_REGIMES.reel_simplifie,
			project.taxRegime
		)
	);
	const amortInfoContent = $derived(getAmortizationInfoContent(project.taxRegime));
</script>

<Modal title="Amortissements & impôts — édition" titleId="modal-amort-taxes-title" {onClose}>
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
</Modal>
