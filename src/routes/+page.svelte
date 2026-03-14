<script lang="ts">
	import { simulateProject } from '$lib/calculations';
	import { Project } from '$lib/domain';
	import {
		ProjetSection,
		CostSection,
		FinancingSection,
		RevenueSection,
		ChargesSection,
		TaxesSection,
		FutureWorksSection,
		AmortizationSection
	} from '$lib/components/sections';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let project = $state(Project.createDefault());

	const simulationResult = $derived(
		simulateProject(
			project.buildSimulationInput(),
			project.primaryFinancing.loanDuration
		)
	);

	const firstYearResult = $derived(simulationResult?.resultsByYear[0]);
	const firstYearNet = $derived(firstYearResult?.net_cashflow ?? 0);
	const monthlyCashflow = $derived(firstYearNet / 12);
</script>

<Header
	projectName={project.projectName}
	projectType={project.projectType}
	taxRegime={project.taxRegime}
/>

<main class="max-w-[1920px] mx-auto mb-20 p-4 md:p-6 pb-28 space-y-4 flex flex-col min-h-screen">
	<div class="flex-1 overflow-x-auto overflow-y-hidden pb-2" style="min-height: 0;">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 min-w-0" style="min-width: min(100%, 1200px);">
			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<ProjetSection project={project} />
				<CostSection cost={project.cost} projectType={project.projectType} />
				<FinancingSection
					financing={project.primaryFinancing}
					totalProjectCost={project.totalProjectCost}
					totalProjectCostWithInterest={project.totalProjectCostWithInterest}
				/>
			</div>

			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<RevenueSection revenue={project.revenue} />
				<AmortizationSection
					projectType={project.projectType}
					costs={project.cost}
					taxRegime={project.taxRegime}
				/>
			</div>

			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<ChargesSection charges={project.charges} />
				<FutureWorksSection
					project={project}
					horizonYears={project.primaryFinancing.loanDuration}
				/>
				<TaxesSection
					taxes={project.taxes}
					taxRegime={project.taxRegime}
					lmnpSubRegime={project.lmnpSubRegime}
					annualRevenueAfterVacancy={project.annualRevenueAfterVacancy}
					{simulationResult}
				/>
			</div>
		</div>
	</div>
</main>

{#if simulationResult}
	<Footer
		{monthlyCashflow}
		revenues={project.annualRevenueAfterVacancy}
		totalProjectCost={project.totalProjectCostWithInterest}
		charges={project.charges.chargesUsedForCalculation}
		{simulationResult}
		loanAmount={project.primaryFinancing.loanAmount}
		loanDuration={project.primaryFinancing.loanDuration}
	/>
{/if}
