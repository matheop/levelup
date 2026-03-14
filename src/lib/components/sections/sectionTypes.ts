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
	totalProjectCost?: number;
	/** Coût total du projet + intérêts du crédit + assurance emprunteur sur la durée du prêt. */
	totalProjectCostWithInterest?: number;
	purchasePrice: number;
	notaryFees: number;
	agencyFees: number;
	renovationCost: number;
	furnitureCost: number;
	bankFees: number;
}

export interface FinancingSectionState {
	loanAmount: number; // montant emprunté
	interestRate: number; // taux annuel
	loanDuration: number;
	loanDeferralMonths: number; // nombre de mois de différé
	loanInsuranceMonthly: number;
}

export interface RentEntry {
	monthly_amount: number; // loyer mensuel
}

export interface OtherIncomeEntry {
	label: string;
	amount: number;
}

export interface RevenueSectionState {
	rents: RentEntry[];
	otherIncomes: OtherIncomeEntry[];
	vacancyRate: number; // taux de vacance locative
}

export interface ChargesSectionState {
	propertyTax: number; // taxe foncière
	coOwnershipFees: number; // charges de copropriété
	managementFees: number; // gestion locative
	insurance: number; // assurances
	utilities: number; // factures (électricité, eau…)
	accountingFees: number; // honoraires comptables
	maintenanceProvision: number; // provision pour entretien
	totalAnnualCharges?: number;
	totalRecoverableCharges?: number;
	chargesUsedForCalculation?: number;
}

export interface FutureWorkEntry {
	work_type: string; // type de travaux
	estimated_cost: number; // coût estimé
	planned_year: number; // année de planification
	frequency_years: number; // fréquence (années entre deux travaux)
}

/** Pour LMNP : tranche marginale IR (ex. 0.30 = 30 %), prélèvements sociaux (ex. 0.186 en 2026). */
export interface TaxesSectionState {
	/** Tranche marginale d'imposition (défaut 30 %). */
	taxBracketRate: number;
	/** Taux des prélèvements sociaux (défaut 18,6 % en 2026). */
	socialContributionsRate: number;
}
