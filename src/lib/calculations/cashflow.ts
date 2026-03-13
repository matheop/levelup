/**
 * Revenue, expense, tax and cash-flow calculations by tax regime.
 */

import type { TaxRegimeName } from '$lib/dbTypes';
import { annualDepreciationTotal } from './depreciation';
import type { DepreciationRow } from './depreciation';
import { annualLoanPayment, annualInterestForYear } from './loan';
import type { LoanParams } from './loan';

const DEFICIT_FONCIER_CAP = 10_700; // €/year
const LMNP_ACQUISITION_AMORT_YEARS = 10; // frais d'acquisition (notaire, agence) sur 10 ans

export interface RevenueInput {
	monthly_rent: number | null;
	other_income?: number;
	ancillary_income?: number;
}

export interface ExpensesInput {
	property_tax: number;
	co_ownership_fees: number;
	management_fees: number;
	insurance: number;
	utilities: number;
	accounting_fees: number;
	maintenance_provision: number;
}

/**
 * Annual rental revenue after vacancy.
 * vacancy_rate as decimal (e.g. 0.08 for 8%).
 */
export function annualRevenues(
	revenue: RevenueInput,
	vacancy_rate: number
): number {
	const rent = (revenue.monthly_rent ?? 0) * 12 * (1 - vacancy_rate);
	const other = (revenue.other_income ?? 0) + (revenue.ancillary_income ?? 0);
	return rent + other;
}

/** Charges récupérables sur le locataire (copro, gestion, factures) : à déduire pour le cash-flow. */
export function recoverableCharges(expenses: ExpensesInput): number {
	return (
		expenses.co_ownership_fees +
		expenses.management_fees +
		expenses.utilities
	);
}

/**
 * Charges annuelles prises en compte dans le calcul du cash-flow :
 * total des charges − charges récupérables + moyenne des travaux futurs.
 * Les charges récupérables (copro, gestion, factures) sont déduites car refacturées au locataire.
 */
export function annualExpenses(
	expenses: ExpensesInput,
	futureWorksAnnualAverage: number = 0
): number {
	const totalFixed =
		expenses.property_tax +
		expenses.co_ownership_fees +
		expenses.management_fees +
		expenses.insurance +
		expenses.utilities +
		expenses.accounting_fees +
		expenses.maintenance_provision;
	const recoverable = recoverableCharges(expenses);
	return totalFixed - recoverable + futureWorksAnnualAverage;
}

/**
 * Impôts et prélèvements sociaux pour une année.
 * - LMNP micro : base = revenus bruts × 50 %, puis IR (tranche) + PS (taux).
 * - LMNP régime réel : base = résultat après charges, frais d'acquisition, intérêts, déficit reporté, amortissement (sans creuser le déficit).
 * - NU : déficit foncier éventuel (plafonné), PS sur résultat imposable.
 * - SCI_IS : IS sur résultat, pas de PS.
 */
export function taxForRegime(
	regime: TaxRegimeName,
	taxableResult: number,
	socialContributionsRate: number = 0.186,
	isTaxRate: number | null = 0.25, // SCI_IS
	/** LMNP : tranche marginale IR (ex. 0.30). */
	taxBracketRate: number | null = null,
	/** LMNP micro 50 % : revenus annuels après vacance (pour base abattue). */
	annualRevenuesForLmnpMicro: number | null = null
): {
	tax: number;
	socialContributions: number;
	taxDeductibleDeficit: number;
} {
	let tax = 0;
	let taxDeductibleDeficit = 0;
	let baseForSocial = taxableResult;

	if (regime === 'LMNP' && taxBracketRate != null && annualRevenuesForLmnpMicro != null) {
		// Micro LMNP LMLD : abattement 50 % sur les revenus
		const taxableBase = Math.max(0, annualRevenuesForLmnpMicro * 0.5);
		tax = taxableBase * taxBracketRate;
		baseForSocial = taxableBase;
	}
	if (regime === 'NU' && taxableResult < 0) {
		taxDeductibleDeficit = Math.min(-taxableResult, DEFICIT_FONCIER_CAP);
	}
	if (regime === 'SCI_IS' && isTaxRate != null) {
		tax = Math.max(0, taxableResult * isTaxRate);
	}

	const socialContributions =
		regime === 'SCI_IS' ? 0 : Math.max(0, baseForSocial * socialContributionsRate);

	return { tax, socialContributions, taxDeductibleDeficit };
}

export interface LmnpReelCarryforward {
	deficit: number;
	depreciation: number;
}

/**
 * Cash-flow annuel (une année).
 *
 * - LMNP micro : base = revenus × 50 %, IR + PS.
 * - LMNP régime réel : charges + amort. frais d'acquisition (notaire/10) + intérêts d'emprunt déductibles ;
 *   déficit reportable 10 ans ; amortissement bien/meubles déductible sans créer de déficit (report possible).
 */
export function cashflowForYear(params: {
	revenue: RevenueInput;
	expenses: ExpensesInput;
	vacancy_rate: number;
	loanParams: LoanParams;
	depreciationRows: DepreciationRow[];
	futureWorksAnnualAverage: number;
	regime: TaxRegimeName;
	socialContributionsRate: number;
	isTaxRate: number | null;
	taxBracketRate?: number | null;
	/** Année (1-based) pour intérêts d'emprunt et LMNP réel. */
	year?: number;
	/** LMNP régime réel : report déficit + amortissement (entrée). */
	lmnpReelCarryforwardIn?: LmnpReelCarryforward;
	/** Frais d'acquisition pour amortissement 10 ans en LMNP réel : notaire + agence. */
	notary_fees?: number;
	agency_fees?: number;
	/** micro_bic = abattement 50 % ; regime_reel_simplifie = charges + amort + déficit reportable. */
	lmnp_sub_regime?: 'micro_bic' | 'regime_reel_simplifie';
}): {
	gross_cashflow: number;
	net_cashflow: number;
	tax_deductible_deficit: number;
	lmnpReelCarryforwardOut?: LmnpReelCarryforward;
} {
	const revenues = annualRevenues(params.revenue, params.vacancy_rate);
	const expenses = annualExpenses(params.expenses, params.futureWorksAnnualAverage);
	const loanPayment = annualLoanPayment(params.loanParams);
	const gross_cashflow = revenues - expenses - loanPayment;

	const depreciationTotal = annualDepreciationTotal(params.depreciationRows);
	const year = params.year ?? 1;
	const acquisitionFees = (params.notary_fees ?? 0) + (params.agency_fees ?? 0);
	const acquisitionAmortAnnual = acquisitionFees / LMNP_ACQUISITION_AMORT_YEARS;

	const isLmnpReel =
		params.regime === 'LMNP' && params.lmnp_sub_regime === 'regime_reel_simplifie';

	let taxableResult: number;
	let tax = 0;
	let socialContributions = 0;
	let taxDeductibleDeficit = 0;
	let lmnpReelCarryforwardOut: LmnpReelCarryforward | undefined;

	if (isLmnpReel) {
		const loanInterest = annualInterestForYear(params.loanParams, year);
		const resultBeforeDepreciation =
			revenues - expenses - loanInterest - acquisitionAmortAnnual;
		const deficitIn = params.lmnpReelCarryforwardIn?.deficit ?? 0;
		const depreciationCfIn = params.lmnpReelCarryforwardIn?.depreciation ?? 0;

		if (resultBeforeDepreciation < 0) {
			lmnpReelCarryforwardOut = {
				deficit: deficitIn + -resultBeforeDepreciation,
				depreciation: depreciationCfIn + depreciationTotal
			};
			taxableResult = 0;
		} else {
			const useDeficit = Math.min(deficitIn, resultBeforeDepreciation);
			const remaining = resultBeforeDepreciation - useDeficit;
			const deductibleDepreciation = Math.min(
				depreciationCfIn + depreciationTotal,
				remaining
			);
			taxableResult = remaining - deductibleDepreciation;
			lmnpReelCarryforwardOut = {
				deficit: deficitIn - useDeficit,
				depreciation: depreciationCfIn + depreciationTotal - deductibleDepreciation
			};
		}

		tax = Math.max(0, taxableResult * (params.taxBracketRate ?? 0.3));
		socialContributions = Math.max(0, taxableResult * params.socialContributionsRate);
	} else {
		const deductibleDepreciation =
			params.regime === 'NU' ? 0 : depreciationTotal;
		taxableResult = gross_cashflow - deductibleDepreciation;

		const taxResult = taxForRegime(
			params.regime,
			taxableResult,
			params.socialContributionsRate,
			params.isTaxRate,
			params.taxBracketRate ?? null,
			params.regime === 'LMNP' && params.lmnp_sub_regime !== 'regime_reel_simplifie'
				? revenues
				: null
		);
		tax = taxResult.tax;
		socialContributions = taxResult.socialContributions;
		taxDeductibleDeficit = taxResult.taxDeductibleDeficit;
	}

	const net_cashflow = gross_cashflow - tax - socialContributions;

	return {
		gross_cashflow,
		net_cashflow,
		tax_deductible_deficit: taxDeductibleDeficit,
		...(lmnpReelCarryforwardOut !== undefined && {
			lmnpReelCarryforwardOut
		})
	};
}
