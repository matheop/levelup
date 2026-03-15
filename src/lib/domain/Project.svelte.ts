import type { TaxRegimeName } from '$lib/dbTypes';
import type { SimulationInput } from '$lib/calculations';
import type { ProjectType } from '$lib/dbTypes';
import { LMNP_SUB_REGIMES, type LmnpSubRegime } from '$lib/constants';
import { getAmortizationData } from '$lib/components/sections/amortizationCalc';
import { Cost } from './Cost.svelte';
import { Financing } from './Financing.svelte';
import { Revenue } from './Revenue.svelte';
import { Charges } from './Charges.svelte';
import { Taxes } from './Taxes.svelte';
import { FutureWork } from './FutureWork.svelte';

/**
 * Projet agrégat : coûts, financements, revenus, charges, taxes, travaux futurs.
 * Tous les champs sont réactifs ($state) pour binding dans les composants.
 */
export class Project {
	projectName = $state('');
	projectType = $state<ProjectType>('purchase');
	taxRegime = $state<TaxRegimeName>('LMNP');
	lmnpSubRegime = $state<LmnpSubRegime>(LMNP_SUB_REGIMES.reel_simplifie);

	cost: Cost;
	financings = $state<Financing[]>([]);
	revenue: Revenue;
	charges: Charges;
	taxes: Taxes;
	futureWorks = $state<FutureWork[]>([]);

	constructor(init?: {
		projectName?: string;
		projectType?: ProjectType;
		taxRegime?: TaxRegimeName;
		lmnpSubRegime?: LmnpSubRegime;
		cost?: Partial<InstanceType<typeof Cost>>;
		financings?: Partial<InstanceType<typeof Financing>>[];
		revenue?: Partial<ConstructorParameters<typeof Revenue>[0]>;
		charges?: Partial<InstanceType<typeof Charges>>;
		taxes?: Partial<InstanceType<typeof Taxes>>;
		futureWorks?: Partial<InstanceType<typeof FutureWork>>[];
	}) {
		this.cost = new Cost(init?.cost);
		this.financings = (init?.financings?.length ? init.financings : [{ loanAmount: 115500, interestRate: 0.0327, loanDuration: 20, loanDeferralMonths: 0, loanInsuranceMonthly: 5.65 }]).map(
			(f) => new Financing(f)
		);
		this.revenue = new Revenue(init?.revenue);
		this.charges = new Charges(init?.charges);
		this.taxes = new Taxes(init?.taxes);
		this.futureWorks = (init?.futureWorks?.length ? init.futureWorks : [{ work_type: 'Toiture', estimated_cost: 15000, planned_year: 15, frequency_years: 25 }]).map(
			(w) => new FutureWork(w)
		);
		if (init?.projectName != null) this.projectName = init.projectName;
		if (init?.projectType != null) this.projectType = init.projectType;
		if (init?.taxRegime != null) this.taxRegime = init.taxRegime;
		if (init?.lmnpSubRegime != null) this.lmnpSubRegime = init.lmnpSubRegime;
	}

	get primaryFinancing(): Financing {
		return this.financings[0]!;
	}

	get totalProjectCost(): number {
		return this.cost.totalProjectCost(this.projectType);
	}

	get totalProjectCostWithInterest(): number {
		return this.totalProjectCost + this.primaryFinancing.creditInterestTotal();
	}

	get annualRevenueAfterVacancy(): number {
		return this.revenue.annualRevenueAfterVacancy;
	}

	get futureWorksAnnualAverage(): number {
		const duration = this.primaryFinancing.loanDuration || 20;
		return this.futureWorks.length === 0
			? 0
			: this.futureWorks.reduce(
					(s, w) =>
						s + w.estimated_cost / (w.frequency_years || duration),
					0
				);
	}

	/** Charges annuelles récurrentes + coûts annualisés des travaux futurs. */
	get totalChargesAndWorksAnnual(): number {
		return this.charges.totalAnnualCharges + this.futureWorksAnnualAverage;
	}

	get totalChargesAndWorksMonthly(): number {
		return this.totalChargesAndWorksAnnual / 12;
	}

	buildSimulationInput(): SimulationInput {
		const { depreciationRows } = getAmortizationData(this.projectType, this.cost);
		const totalMonthlyRent = this.revenue.totalMonthlyRent;
		const annualRentGross = totalMonthlyRent * 12 * (1 - this.revenue.vacancyRate);
		return {
			regime: this.taxRegime,
			vacancy_rate: this.revenue.vacancyRate,
			social_contributions_rate:
				this.taxRegime === 'SCI_IS' ? 0 : this.taxes.socialContributionsRate,
			is_tax_rate: this.taxRegime === 'SCI_IS' ? 0.25 : null,
			tax_bracket_rate: this.taxRegime === 'LMNP' ? this.taxes.taxBracketRate : null,
			lmnp_sub_regime:
				this.taxRegime === 'LMNP' ? this.lmnpSubRegime : undefined,
			notary_fees:
				this.taxRegime === 'LMNP' && this.projectType === 'purchase'
					? this.cost.notaryFees
					: undefined,
			agency_fees:
				this.taxRegime === 'LMNP' && this.projectType === 'purchase'
					? (this.cost.agencyFees ?? 0)
					: undefined,
			revenue: {
				monthly_rent: totalMonthlyRent,
				other_income: this.revenue.totalOtherIncome,
				ancillary_income: 0
			},
			expenses: {
				property_tax: this.charges.propertyTax,
				co_ownership_fees: this.charges.coOwnershipFees,
				management_fees: this.charges.managementFees,
				insurance: this.charges.insurance,
				utilities: this.charges.utilities,
				accounting_fees: this.charges.accountingFees,
				maintenance_provision: this.charges.maintenanceProvision
			},
			loan: this.primaryFinancing.toLoanParams(),
			depreciation: this.taxRegime === 'NU' ? [] : depreciationRows,
			future_works_annual_average: this.futureWorksAnnualAverage,
			total_investment: this.totalProjectCost,
			annual_rent_gross: annualRentGross
		};
	}

	static createDefault(): Project {
		return new Project({
			projectName: 'Project Test',
			projectType: 'purchase',
			taxRegime: 'LMNP',
			lmnpSubRegime: LMNP_SUB_REGIMES.reel_simplifie,
			cost: {
				purchasePrice: 120000,
				notaryFees: 10000,
				agencyFees: 5000,
				renovationCost: 3000,
				furnitureCost: 7500,
				bankFees: 0
			},
			financings: [
				{
					loanAmount: 115500,
					interestRate: 0.0327,
					loanDuration: 20,
					loanDeferralMonths: 0,
					loanInsuranceMonthly: 5.65
				}
			],
			revenue: {
				rents: [{ monthly_amount: 850 }],
				otherIncomes: [],
				vacancyRate: 0.08
			},
			charges: {
				propertyTax: 860,
				coOwnershipFees: 816,
				managementFees: 0,
				insurance: 196,
				utilities: 0,
				accountingFees: 622,
				maintenanceProvision: 0
			},
			taxes: {
				taxBracketRate: 0.3,
				socialContributionsRate: 0.186
			},
			futureWorks: [
				{
					work_type: 'Toiture',
					estimated_cost: 15000,
					planned_year: 15,
					frequency_years: 25
				}
			]
		});
	}
}
