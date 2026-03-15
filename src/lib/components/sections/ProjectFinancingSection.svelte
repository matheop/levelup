<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import SectionSubtitle from '$lib/components/layout/SectionSubtitle.svelte';
	import ProjetSection from './ProjetSection.svelte';
	import CostSection from './CostSection.svelte';
	import FinancingSection from './FinancingSection.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Project, Financing } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const PROJECT_COST_INFO =
		"Nom du projet, type (achat + travaux ou travaux seuls), régime fiscal. Coûts : prix d'achat, frais de notaire et d'agence, travaux, meubles, frais bancaires.";
	const FINANCEMENT_INFO =
		"Montant emprunté, taux annuel, durée, différé, assurance emprunteur. Apport personnel = coût total du projet − emprunt. Mensualités et coût total du crédit calculés automatiquement.";

	function addFinancing() {
		const first = project.financings[0];
		project.financings = [
			...project.financings,
			new Financing(
				first
					? {
							loanAmount: first.loanAmount,
							interestRate: first.interestRate,
							loanDuration: first.loanDuration,
							loanDeferralMonths: first.loanDeferralMonths,
							loanInsuranceMonthly: first.loanInsuranceMonthly
						}
					: undefined
			)
		];
	}

	function removeFinancing(index: number) {
		if (project.financings.length <= 1) return;
		project.financings = project.financings.filter((_: Financing, i: number) => i !== index);
	}
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
	<div class="space-y-6">
		{#each project.financings as financing, i (financing.id)}
			<div
				class="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4"
				data-financing-index={i}
			>
				<div class="flex items-center justify-between gap-2">
					<h3 class="text-sm font-semibold text-slate-700">Prêt {i + 1}</h3>
					{#if project.financings.length > 1}
						<Button
							variant="outline"
							label="Supprimer"
							tone="danger"
							onClick={() => removeFinancing(i)}
						/>
					{/if}
				</div>
				<FinancingSection
					{financing}
					totalProjectCost={project.totalProjectCost}
					totalProjectCostWithInterest={project.getTotalCostWithInterestForFinancing(financing)}
					embedded
				/>
			</div>
		{/each}
		<Button
			variant="filled"
			label="Ajouter un financement"
			onClick={addFinancing}
		/>
	</div>
</SectionCard>
