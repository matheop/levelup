<script lang="ts">
	import { Project } from '$lib/domain';
	import {
		ProjectFinancingSection,
		RevenueSection,
		AmortizationAndTaxesSection,
		ChargesAndWorksSection,
		FinancingComparisonSection
	} from '$lib/components/sections';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let project = $state(Project.createDefault());

	const simulationResultsByFinancing = $derived(
		project.financings.map((f) => project.simulateForFinancing(f))
	);
	const simulationResult = $derived(
		simulationResultsByFinancing[0] ?? project.simulate()
	);
	const monthlyCashflow = $derived(project.getMonthlyNetCashflow(1));
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
				<ProjectFinancingSection project={project} />
			</div>

			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<RevenueSection revenue={project.revenue} />
				<AmortizationAndTaxesSection project={project} simulationResult={simulationResult} />
			</div>

			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<ChargesAndWorksSection project={project} />
			</div>
		</div>
	</div>
	<div class="mt-6 w-full max-w-5xl mx-auto">
		<FinancingComparisonSection
			{project}
			simulationResultsByFinancing={simulationResultsByFinancing}
		/>
	</div>
</main>

{#if simulationResult}
	<Footer
		{monthlyCashflow}
		revenues={project.annualRevenueAfterVacancy}
		totalProjectCost={project.totalProjectCostWithInterest}
		charges={project.annualChargesForCalculation}
		{simulationResult}
		loanAmount={project.primaryFinancing.loanAmount}
		loanDuration={project.primaryFinancing.loanDuration}
	/>
{/if}
