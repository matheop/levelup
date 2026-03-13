import type { TaxRegimeName } from '$lib/dbTypes';

export type ProjectType = 'purchase' | 'renovation_only';

/** Sous-régime LMNP : micro-BIC (abattement 50 %) ou régime réel simplifié (amortissement, déficit reportable). */
export type LmnpSubRegime = 'micro_bic' | 'regime_reel_simplifie';

export interface ProjectSectionState {
	projectName: string;
	projectType: ProjectType;
	taxRegime: TaxRegimeName;
	/** Utilisé uniquement si taxRegime === 'LMNP'. Défaut : régime réel simplifié. */
	lmnpSubRegime?: LmnpSubRegime;
}

export interface CostSectionState {
	purchasePrice: number;
	notaryFees: number;
	/** Frais d'agence (frais d'acquisition, amortissables en LMNP réel). */
	agencyFees: number;
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

/** Pour LMNP : tranche marginale IR (ex. 0.30 = 30 %), prélèvements sociaux (ex. 0.186 en 2026). */
export interface TaxesSectionState {
	/** Tranche marginale d'imposition (défaut 30 %). */
	taxBracketRate: number;
	/** Taux des prélèvements sociaux (défaut 18,6 % en 2026). */
	socialContributionsRate: number;
}
