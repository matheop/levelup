<script lang="ts">
	import {
		simulateProject,
		totalInterest,
		type SimulationInput,
		type SimulationResult
	} from '$lib/calculations';
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
	import { getAmortizationData } from '$lib/components/sections/amortizationCalc';
	import type {
		ProjectSectionState,
		CostSectionState,
		FinancingSectionState,
		RevenueSectionState,
		ChargesSectionState,
		TaxesSectionState,
		FutureWorkEntry
	} from '$lib/components/sections';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	// --- State par section (seules les valeurs utiles aux autres sections sont dérivées ici) ---
	let project = $state<ProjectSectionState>({
		projectName: 'Project Test',
		projectType: 'purchase',
		taxRegime: 'LMNP',
		lmnpSubRegime: 'regime_reel_simplifie'
	});
	let costs = $state<CostSectionState>({
		purchasePrice: 120000,
		notaryFees: 10000,
		agencyFees: 5000,
		renovationCost: 3000,
		furnitureCost: 7500,
		bankFees: 0,
	});
	let financing = $state<FinancingSectionState>({
		loanAmount: 115500,
		interestRate: 0.0327,
		loanDuration: 20,
		loanDeferralMonths: 0,
		loanInsuranceMonthly: 5.65
	});
	let revenue = $state<RevenueSectionState>({
		rents: [{ monthly_amount: 850 }],
		otherIncomes: [],
		vacancyRate: 0.08
	});
	let charges = $state<ChargesSectionState>({
		propertyTax: 860,
		coOwnershipFees: 816,
		managementFees: 0,
		insurance: 196,
		utilities: 0,
		accountingFees: 622,
		maintenanceProvision: 0,
	});
	let taxes = $state<TaxesSectionState>({
		taxBracketRate: 0.3,
		socialContributionsRate: 0.186
	});
	let futureWorks = $state<FutureWorkEntry[]>([
		{ work_type: 'Toiture', estimated_cost: 15000, planned_year: 15, frequency_years: 25 }
	]);

	let simulationResult = $state<SimulationResult | null>(null);

	// Valeurs dérivées utilisées par plusieurs sections ou par la simulation
	const totalProjectCost = $derived(
		(project.projectType === 'purchase'
			? costs.purchasePrice + costs.notaryFees + (costs.agencyFees ?? 0)
			: 0) +
			costs.renovationCost +
			(costs.furnitureCost || 0) +
			costs.bankFees
	);

	const creditInterestTotal = $derived(
		financing.loanAmount > 0 && financing.loanDuration > 0
			? totalInterest(financing.loanAmount, financing.interestRate, financing.loanDuration) +
				(financing.loanInsuranceMonthly || 0) * 12 * financing.loanDuration
			: 0
	);
	const totalProjectCostWithInterest = $derived(totalProjectCost + creditInterestTotal);

	$effect(() => {
		costs.totalProjectCostWithInterest = totalProjectCostWithInterest;
	});

	const totalMonthlyRent = $derived(
		revenue.rents.reduce((s, r) => s + (r.monthly_amount || 0), 0)
	);
	const totalOtherIncome = $derived(
		revenue.otherIncomes.reduce((s, r) => s + (r.amount || 0), 0)
	);
	const annualRevenueAfterVacancy = $derived(
		totalMonthlyRent * 12 * (1 - revenue.vacancyRate) + totalOtherIncome
	);

	const { depreciationRows: depreciationRowsForSimulation } = $derived(
		getAmortizationData(project.projectType, costs)
	);

	const futureWorksAnnual = $derived(
		futureWorks.length === 0
			? 0
			: futureWorks.reduce(
					(s, w) => s + w.estimated_cost / (w.frequency_years || financing.loanDuration),
					0
				)
	);

	$effect(() => {
		const annualRentGross = totalMonthlyRent * 12 * (1 - revenue.vacancyRate);
		const input: SimulationInput = {
			regime: project.taxRegime,
			vacancy_rate: revenue.vacancyRate,
			social_contributions_rate:
				project.taxRegime === 'SCI_IS' ? 0 : taxes.socialContributionsRate,
			is_tax_rate: project.taxRegime === 'SCI_IS' ? 0.25 : null,
			tax_bracket_rate: project.taxRegime === 'LMNP' ? taxes.taxBracketRate : null,
			lmnp_sub_regime:
				project.taxRegime === 'LMNP' ? (project.lmnpSubRegime ?? 'regime_reel_simplifie') : undefined,
			notary_fees: project.taxRegime === 'LMNP' && project.projectType === 'purchase' ? costs.notaryFees : undefined,
			agency_fees: project.taxRegime === 'LMNP' && project.projectType === 'purchase' ? (costs.agencyFees ?? 0) : undefined,
			revenue: {
				monthly_rent: totalMonthlyRent,
				other_income: totalOtherIncome,
				ancillary_income: 0
			},
			expenses: {
				property_tax: charges.propertyTax,
				co_ownership_fees: charges.coOwnershipFees,
				management_fees: charges.managementFees,
				insurance: charges.insurance,
				utilities: charges.utilities,
				accounting_fees: charges.accountingFees,
				maintenance_provision: charges.maintenanceProvision
			},
			loan: {
				loan_amount: financing.loanAmount,
				interest_rate: financing.interestRate,
				loan_duration: financing.loanDuration,
				loan_deferral_period: financing.loanDeferralMonths
			},
			depreciation:
				project.taxRegime === 'NU' ? [] : depreciationRowsForSimulation,
			future_works_annual_average: futureWorksAnnual,
			total_investment: totalProjectCost,
			annual_rent_gross: annualRentGross
		};
		simulationResult = simulateProject(input, financing.loanDuration);
	});

	// Pour le footer
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
				<ProjetSection bind:project />
				<CostSection bind:costs projectType={project.projectType} />
				<FinancingSection bind:financing {totalProjectCost} totalProjectCostWithInterest={costs.totalProjectCostWithInterest ?? totalProjectCostWithInterest} />
			</div>

			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<RevenueSection bind:revenue />
				<AmortizationSection
					projectType={project.projectType}
					{costs}
					taxRegime={project.taxRegime}
					/>
			</div>
			
			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<ChargesSection bind:charges />
				<FutureWorksSection bind:futureWorks horizonYears={financing.loanDuration} />
				<TaxesSection
					bind:taxes
					taxRegime={project.taxRegime}
					lmnpSubRegime={project.lmnpSubRegime ?? 'regime_reel_simplifie'}
					{annualRevenueAfterVacancy}
					{simulationResult}
				/>
			</div>
		</div>
	</div>

</main>

{#if simulationResult}
	<Footer
		{monthlyCashflow}
		revenues={annualRevenueAfterVacancy}
		totalProjectCost={costs.totalProjectCostWithInterest ?? totalProjectCost}
		charges={charges.chargesUsedForCalculation ?? 0}
		{simulationResult}
		loanAmount={financing.loanAmount}
		loanDuration={financing.loanDuration}
	/>
{/if}