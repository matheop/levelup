import type { TaxRegimeName } from '$lib/dbTypes';

export type ProjectType = 'purchase' | 'renovation_only';

export interface ProjectSectionState {
	projectName: string;
	projectType: ProjectType;
	taxRegime: TaxRegimeName;
}

export interface CostSectionState {
	purchasePrice: number;
	notaryFees: number;
	renovationCost: number;
	furnitureCost: number;
	bankFees: number;
	guaranteeFees: number;
}

export interface FinancingSectionState {
	loanAmount: number;
	interestRate: number;
	loanDuration: number;
	loanDeferralMonths: number;
	loanInsuranceMonthly: number;
}

export interface RentEntry {
	monthly_amount: number;
}

export interface OtherIncomeEntry {
	label: string;
	amount: number;
}

export interface RevenueSectionState {
	rents: RentEntry[];
	otherIncomes: OtherIncomeEntry[];
	vacancyRate: number;
}

export interface ChargesSectionState {
	propertyTax: number;
	coOwnershipFees: number;
	managementFees: number;
	insurance: number;
	utilities: number;
	accountingFees: number;
	maintenanceProvision: number;
}

export interface FutureWorkEntry {
	work_type: string;
	estimated_cost: number;
	planned_year: number;
	frequency_years: number;
}
