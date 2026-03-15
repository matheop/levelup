<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import SectionSubtitle from '$lib/components/layout/SectionSubtitle.svelte';
	import ProjetSection from './ProjetSection.svelte';
	import CostSection from './CostSection.svelte';
	import FinancingSection from './FinancingSection.svelte';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const PROJECT_COST_INFO	=
		"Nom du projet, type (achat + travaux ou travaux seuls), régime fiscal. Coûts : prix d'achat, frais de notaire et d'agence, travaux, meubles, frais bancaires.";
	const FINANCEMENT_INFO =
		"Montant emprunté, taux annuel, durée, différé, assurance emprunteur. Apport personnel = coût total du projet − emprunt. Mensualités et coût total du crédit calculés automatiquement.";
</script>

<SectionCard title="Projet & financement">
	<SectionSubtitle
		title="1. Le bien et/ou les travaux"
		infoContent={PROJECT_COST_INFO}
	/>
	<div class="space-y-4 mb-6">
		<ProjetSection project={project} embedded />
		<CostSection cost={project.cost} projectType={project.projectType} embedded />
	</div>
	<SectionSubtitle
		title="2. Financement"
		infoContent={FINANCEMENT_INFO}
		className="pt-4 border-t border-indigo-200"
	/>
	<FinancingSection
		financing={project.primaryFinancing}
		totalProjectCost={project.totalProjectCost}
		totalProjectCostWithInterest={project.totalProjectCostWithInterest}
		embedded
	/>
</SectionCard>
