import type { TaxRegimeName } from '$lib/dbTypes';
import {
	type SimulationInput,
	simulateProject,
	cashflowForYear,
	type SimulationResult
} from '$lib/calculations';
import type { ProjectType } from '$lib/dbTypes';
import { LMNP_SUB_REGIMES, type LmnpSubRegime } from '$lib/constants';
import { getAmortizationData } from '$lib/components/sections/amortizationCalc';
import { Cost } from './Cost.svelte';
import { Financing } from './Financing.svelte';
import { Revenue } from './Revenue.svelte';
import { Charges } from './Charges.svelte';
import { Taxes } from './Taxes.svelte';
import type { TaxBracketRate } from './Taxes.svelte';
import { FutureWork } from './FutureWork.svelte';

export interface ProjectUserInputs {
	id?: string;
	projectName: string;
	projectType: ProjectType;
	taxRegime: TaxRegimeName;
	lmnpSubRegime: LmnpSubRegime;
	cost: {
		purchasePrice: number;
		notaryFees: number;
		agencyFees: number;
		renovationCost: number;
		furnitureCost: number;
		bankFees: number;
	};
	financings: {
		loanAmount: number;
		interestRate: number;
		loanDuration: number;
		loanDeferralMonths: number;
		loanInsuranceMonthly: number;
	}[];
	revenue: {
		rents: { monthly_amount: number }[];
		otherIncomes: { label: string; amount: number }[];
		vacancyRate: number;
	};
	charges: {
		propertyTax: number;
		coOwnershipFees: number;
		managementFees: number;
		insurance: number;
		utilities: number;
		accountingFees: number;
		maintenanceProvision: number;
	};
	taxes: {
		taxBracketRate: number;
		socialContributionsRate: number;
	};
	futureWorks: {
		work_type: string;
		estimated_cost: number;
		planned_year: number;
		frequency_years: number;
	}[];
}

/**
 * Projet agrégat : coûts, financements, revenus, charges, taxes, travaux futurs.
 * Tous les champs sont réactifs ($state) pour binding dans les composants.
 */
export class Project {
	id = $state<string | null>(null);
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
		this.futureWorks =
			init?.futureWorks !== undefined
				? init.futureWorks.map((w) => new FutureWork(w))
				: [{ work_type: 'Toiture', estimated_cost: 15000, planned_year: 15, frequency_years: 25 }].map(
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

	/** Moyenne annuelle des travaux futurs pour une durée d'horizon donnée (ex. durée du prêt). */
	getFutureWorksAnnualAverageForDuration(duration: number): number {
		const d = duration || 20;
		return this.futureWorks.length === 0
			? 0
			: this.futureWorks.reduce(
					(s, w) => s + w.estimated_cost / (w.frequency_years || d),
					0
				);
	}

	get futureWorksAnnualAverage(): number {
		return this.getFutureWorksAnnualAverageForDuration(
			this.primaryFinancing.loanDuration || 20
		);
	}

	/** Charges annuelles récurrentes + coûts annualisés des travaux futurs. */
	get totalChargesAndWorksAnnual(): number {
		return this.charges.totalAnnualCharges + this.futureWorksAnnualAverage;
	}

	get totalChargesAndWorksMonthly(): number {
		return this.totalChargesAndWorksAnnual / 12;
	}

	/** Charges annuelles pour le calcul (charges retenues + moyenne travaux futurs). Alias de totalChargesAndWorksAnnual. */
	get annualChargesForCalculation(): number {
		return this.totalChargesAndWorksAnnual;
	}

	/** Mensualité crédit + assurance. */
	get monthlyPaymentWithInsurance(): number {
		return this.primaryFinancing.monthlyPayment() + (this.primaryFinancing.loanInsuranceMonthly ?? 0);
	}

	/**
	 * Cash-flow pour une année donnée (1-based).
	 * Pour LMNP régime réel, le report de déficit n'est pris en compte que lorsqu'on enchaîne les années via simulate().
	 */
	getCashflowForYear(year: number): {
		gross_cashflow: number;
		net_cashflow: number;
		tax_deductible_deficit: number;
	} {
		const input = this.buildSimulationInput();
		const cf = cashflowForYear({
			revenue: input.revenue,
			expenses: input.expenses,
			vacancy_rate: input.vacancy_rate,
			loanParams: input.loan,
			depreciationRows: input.depreciation,
			futureWorksAnnualAverage: input.future_works_annual_average,
			regime: input.regime,
			socialContributionsRate: input.social_contributions_rate,
			isTaxRate: input.is_tax_rate,
			taxBracketRate: input.tax_bracket_rate ?? null,
			year,
			notary_fees: input.notary_fees,
			agency_fees: input.agency_fees,
			lmnp_sub_regime: input.lmnp_sub_regime
		});
		return {
			gross_cashflow: cf.gross_cashflow,
			net_cashflow: cf.net_cashflow,
			tax_deductible_deficit: cf.tax_deductible_deficit
		};
	}

	/** Cash-flow net mensuel pour une année (année 1-based). */
	getMonthlyNetCashflow(year: number): number {
		return this.getCashflowForYear(year).net_cashflow / 12;
	}

	/** Lance la simulation pour un financement donné (sur sa durée). */
	simulateForFinancing(financing: Financing): SimulationResult {
		const input = this.buildSimulationInputForFinancing(financing);
		const n = financing.loanDuration || 20;
		return simulateProject(input, n);
	}

	/** Lance la simulation sur la durée du premier prêt. Délègue au premier financement. */
	simulate(): SimulationResult {
		return this.simulateForFinancing(this.primaryFinancing);
	}

	/** Coût total du projet + intérêts et assurance pour un financement donné. */
	getTotalCostWithInterestForFinancing(financing: Financing): number {
		return this.totalProjectCost + financing.creditInterestTotal();
	}

	buildSimulationInput(): SimulationInput {
		return this.buildSimulationInputForFinancing(this.primaryFinancing);
	}

	buildSimulationInputForFinancing(financing: Financing): SimulationInput {
		const { depreciationRows } = getAmortizationData(this.projectType, this.cost);
		const totalMonthlyRent = this.revenue.totalMonthlyRent;
		const annualRentGross = totalMonthlyRent * 12 * (1 - this.revenue.vacancyRate);
		const duration = financing.loanDuration || 20;
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
				this.projectType === 'purchase' &&
				(this.taxRegime === 'LMNP' || this.taxRegime === 'SCI_IS')
					? this.cost.notaryFees
					: undefined,
			agency_fees:
				this.projectType === 'purchase' &&
				(this.taxRegime === 'LMNP' || this.taxRegime === 'SCI_IS')
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
			loan: financing.toLoanParams(),
			depreciation: this.taxRegime === 'NU' ? [] : depreciationRows,
			future_works_annual_average: this.getFutureWorksAnnualAverageForDuration(duration),
			total_investment: this.totalProjectCost,
			annual_rent_gross: annualRentGross
		};
	}

	/** Nom proposé pour un brouillon : `Projet {nombre de projets sauvegardés + 1}`. */
	static defaultProjectName(savedProjectCount: number): string {
		const n = Math.max(0, Math.floor(savedProjectCount)) + 1;
		return `Projet ${n}`;
	}

	static createDefault(savedProjectCount = 0): Project {
		return new Project({
			projectName: Project.defaultProjectName(savedProjectCount),
			projectType: 'purchase',
			taxRegime: 'LMNP',
			lmnpSubRegime: LMNP_SUB_REGIMES.reel_simplifie,
			cost: {
				purchasePrice: 0,
				notaryFees: 0,
				agencyFees: 0,
				renovationCost: 0,
				furnitureCost: 0,
				bankFees: 0
			},
			financings: [
				{
					loanAmount: 0,
					interestRate: 0.0327,
					loanDuration: 20,
					loanDeferralMonths: 0,
					loanInsuranceMonthly: 0
				}
			],
			revenue: {
				rents: [{ monthly_amount: 0 }],
				otherIncomes: [],
				vacancyRate: 0.08
			},
			charges: {
				propertyTax: 0,
				coOwnershipFees: 0,
				managementFees: 0,
				insurance: 0,
				utilities: 0,
				accountingFees: 0,
				maintenanceProvision: 0
			},
			taxes: {
				taxBracketRate: 0.3,
				socialContributionsRate: 0.186
			},
			futureWorks: []
		});
	}

	toUserInputs(): ProjectUserInputs {
		return {
			...(this.id != null && { id: this.id }),
			projectName: this.projectName,
			projectType: this.projectType,
			taxRegime: this.taxRegime,
			lmnpSubRegime: this.lmnpSubRegime,
			cost: {
				purchasePrice: this.cost.purchasePrice,
				notaryFees: this.cost.notaryFees,
				agencyFees: this.cost.agencyFees,
				renovationCost: this.cost.renovationCost,
				furnitureCost: this.cost.furnitureCost,
				bankFees: this.cost.bankFees
			},
			financings: this.financings.map((f) => ({
				loanAmount: f.loanAmount,
				interestRate: f.interestRate,
				loanDuration: f.loanDuration,
				loanDeferralMonths: f.loanDeferralMonths,
				loanInsuranceMonthly: f.loanInsuranceMonthly
			})),
			revenue: {
				rents: this.revenue.rents.map((r) => ({ monthly_amount: r.monthly_amount })),
				otherIncomes: this.revenue.otherIncomes.map((o) => ({ label: o.label, amount: o.amount })),
				vacancyRate: this.revenue.vacancyRate
			},
			charges: {
				propertyTax: this.charges.propertyTax,
				coOwnershipFees: this.charges.coOwnershipFees,
				managementFees: this.charges.managementFees,
				insurance: this.charges.insurance,
				utilities: this.charges.utilities,
				accountingFees: this.charges.accountingFees,
				maintenanceProvision: this.charges.maintenanceProvision
			},
			taxes: {
				taxBracketRate: this.taxes.taxBracketRate,
				socialContributionsRate: this.taxes.socialContributionsRate
			},
			futureWorks: this.futureWorks.map((w) => ({
				work_type: w.work_type,
				estimated_cost: w.estimated_cost,
				planned_year: w.planned_year,
				frequency_years: w.frequency_years
			}))
		};
	}

	static fromUserInputs(inputs: ProjectUserInputs): Project {
		const project = new Project({
			projectName: inputs.projectName,
			projectType: inputs.projectType,
			taxRegime: inputs.taxRegime,
			lmnpSubRegime: inputs.lmnpSubRegime,
			cost: inputs.cost,
			financings: inputs.financings,
			revenue: inputs.revenue,
			charges: inputs.charges,
			taxes: {
				taxBracketRate: inputs.taxes.taxBracketRate as TaxBracketRate,
				socialContributionsRate: inputs.taxes.socialContributionsRate
			},
			futureWorks: inputs.futureWorks
		});
		project.id = inputs.id ?? null;
		return project;
	}
}
