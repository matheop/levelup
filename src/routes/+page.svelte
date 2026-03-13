<script lang="ts">
	import {
		simulateProject,
		type SimulationInput,
		type SimulationResult
	} from '$lib/calculations';
	import {
		ProjetSection,
		CostSection,
		FinancingSection,
		RevenueSection,
		ChargesSection,
		FutureWorksSection,
		AmortizationSection,
		ResultsSection
	} from '$lib/components/sections';
	import { getAmortizationData } from '$lib/components/sections/amortizationCalc';
	import type {
		ProjectSectionState,
		CostSectionState,
		FinancingSectionState,
		RevenueSectionState,
		ChargesSectionState,
		FutureWorkEntry
	} from '$lib/components/sections';

	// --- State par section (seules les valeurs utiles aux autres sections sont dérivées ici) ---
	let project = $state<ProjectSectionState>({
		projectName: 'Project Test',
		projectType: 'purchase',
		taxRegime: 'LMNP'
	});
	let costs = $state<CostSectionState>({
		purchasePrice: 125000,
		notaryFees: 10000,
		renovationCost: 3000,
		furnitureCost: 7500,
		bankFees: 0,
		guaranteeFees: 0
	});
	let financing = $state<FinancingSectionState>({
		loanAmount: 115500,
		interestRate: 0.0327,
		loanDuration: 20,
		loanDeferralMonths: 0,
		loanInsuranceMonthly: 0
	});
	let revenue = $state<RevenueSectionState>({
		rents: [{ monthly_amount: 850 }],
		otherIncomes: [],
		vacancyRate: 0.08
	});
	let charges = $state<ChargesSectionState>({
		propertyTax: 865,
		coOwnershipFees: 840,
		managementFees: 0,
		insurance: 204,
		utilities: 0,
		accountingFees: 620,
		maintenanceProvision: 500
	});
	let futureWorks = $state<FutureWorkEntry[]>([
		{ work_type: 'Toiture', estimated_cost: 15000, planned_year: 15, frequency_years: 25 }
	]);

	let simulationResult = $state<SimulationResult | null>(null);

	// Valeurs dérivées utilisées par plusieurs sections ou par la simulation
	const totalProjectCost = $derived(
		(project.projectType === 'purchase' ? costs.purchasePrice + costs.notaryFees : 0) +
			costs.renovationCost +
			(costs.furnitureCost || 0) +
			costs.bankFees +
			costs.guaranteeFees
	);

	const totalMonthlyRent = $derived(
		revenue.rents.reduce((s, r) => s + (r.monthly_amount || 0), 0)
	);
	const totalOtherIncome = $derived(
		revenue.otherIncomes.reduce((s, r) => s + (r.amount || 0), 0)
	);

	const { depreciationRows: depreciationRowsForSimulation } = $derived(
		getAmortizationData(project.projectType, costs)
	);

	const horizonYears = 25;
	const futureWorksAnnual = $derived(
		futureWorks.length === 0
			? 0
			: futureWorks.reduce(
					(s, w) => s + w.estimated_cost / (w.frequency_years || horizonYears),
					0
				)
	);

	$effect(() => {
		const annualRentGross = totalMonthlyRent * 12 * (1 - revenue.vacancyRate);
		const input: SimulationInput = {
			regime: project.taxRegime,
			vacancy_rate: revenue.vacancyRate,
			social_contributions_rate: project.taxRegime === 'SCI_IS' ? 0 : 0.172,
			is_tax_rate: project.taxRegime === 'SCI_IS' ? 0.25 : null,
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
		simulationResult = simulateProject(input, horizonYears);
	});

	// Pour le footer
	const firstYearNet = $derived(simulationResult?.resultsByYear[0]?.net_cashflow ?? 0);
	const monthlyCashflow = $derived(firstYearNet / 12);
</script>

<main class="max-w-[1920px] mx-auto p-4 md:p-6 pb-24 space-y-4 flex flex-col min-h-screen">
	<header class="flex-shrink-0 rounded-xl border border-slate-200 bg-slate-800 text-white px-5 py-4 shadow-sm">
		<div class="flex flex-wrap items-center gap-4 md:gap-8">
			<h1 class="text-xl font-semibold">{project.projectName || 'Sans nom'}</h1>
			<span class="text-slate-300">|</span>
			<span class="text-sm md:text-base"
				>{project.projectType === 'purchase' ? 'Achat + travaux' : 'Travaux seuls'}</span
			>
			<span class="text-slate-300">|</span>
			<span class="text-sm md:text-base"
				>{project.taxRegime === 'LMNP'
					? 'LMNP'
					: project.taxRegime === 'NU'
						? 'Location nue'
						: "SCI à l'IS"}</span
			>
		</div>
	</header>

	<div class="flex-1 overflow-x-auto overflow-y-hidden pb-2" style="min-height: 0;">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 min-w-0" style="min-width: min(100%, 1200px);">
			<div class="space-y-6 min-w-[320px] max-h-[70vh] overflow-y-auto overflow-x-hidden">
				<ProjetSection bind:project />
				<CostSection bind:costs projectType={project.projectType} />
				<FinancingSection bind:financing {totalProjectCost} />
			</div>

			<div class="space-y-6 min-w-[320px] max-h-[70vh] overflow-y-auto overflow-x-hidden">
				<RevenueSection bind:revenue />
				<ChargesSection bind:charges />
			</div>

			<div class="space-y-6 min-w-[320px] max-h-[70vh] overflow-y-auto overflow-x-hidden">
				<FutureWorksSection bind:futureWorks />
				<AmortizationSection
					projectType={project.projectType}
					{costs}
					taxRegime={project.taxRegime}
				/>
			</div>
		</div>
	</div>

	{#if simulationResult}
		<ResultsSection
			{simulationResult}
			loanAmount={financing.loanAmount}
			loanDuration={financing.loanDuration}
		/>

		<footer
			class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-700 bg-slate-800 text-white px-5 py-3 shadow-lg"
		>
			<div
				class="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12"
			>
				<div class="text-center">
					<p class="text-slate-400 text-sm">Cash-flow mensuel (an 1)</p>
					<p
						class="text-lg font-semibold {monthlyCashflow >= 0
							? 'text-emerald-400'
							: 'text-rose-400'}"
					>
						{monthlyCashflow.toLocaleString('fr-FR', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})} €
					</p>
				</div>
				<span class="text-slate-500 hidden md:inline">|</span>
				<div class="text-center">
					<p class="text-slate-400 text-sm">Cash-flow annuel (an 1)</p>
					<p
						class="text-lg font-semibold {firstYearNet >= 0
							? 'text-emerald-400'
							: 'text-rose-400'}"
					>
						{firstYearNet.toLocaleString('fr-FR', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})} €
					</p>
				</div>
				<span class="text-slate-500 hidden md:inline">|</span>
				<div class="text-center">
					<p class="text-slate-400 text-sm">Coût total du projet</p>
					<p class="text-lg font-semibold text-white">
						{simulationResult.total_investment.toLocaleString('fr-FR')} €
					</p>
				</div>
			</div>
		</footer>
	{/if}
</main>
