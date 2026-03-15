/**
 * Simulation entry: project data in → results by year, yields, IRR.
 */

import type { TaxRegimeName } from '$lib/dbTypes';
import { cashflowForYear } from './cashflow';
import type { DepreciationRow } from './depreciation';
import type { LoanParams } from './loan';
import { irr } from './irr';
import { LMNP_SUB_REGIMES, type LmnpSubRegime } from '$lib/constants';

export interface SimulationInput {
	regime: TaxRegimeName;
	vacancy_rate: number;
	social_contributions_rate: number;
	is_tax_rate: number | null; // for SCI_IS
	/** LMNP only: marginal tax bracket (e.g. 0.30 for 30 %). */
	tax_bracket_rate?: number | null;
	/** LMNP only: micro_bic (abattement 50 %) or reel_simplifie (défaut). */
	lmnp_sub_regime?: LmnpSubRegime;
	/** Frais d'acquisition pour LMNP régime réel (amort. 10 ans). */
	notary_fees?: number;
	agency_fees?: number;
	revenue: {
		monthly_rent: number | null;
		other_income?: number;
		ancillary_income?: number;
	};
	expenses: {
		property_tax: number;
		co_ownership_fees: number;
		management_fees: number;
		insurance: number;
		utilities: number;
		accounting_fees: number;
		maintenance_provision: number;
	};
	loan: LoanParams;
	depreciation: DepreciationRow[];
	future_works_annual_average: number;
	/** Total cost invested (for yield %) */
	total_investment: number;
	/** Annual rental revenue (gross, for gross yield) */
	annual_rent_gross: number;
}

export interface YearResult {
	year: number;
	gross_cashflow: number;
	net_cashflow: number;
	tax_deductible_deficit: number;
}

export interface SimulationResult {
	resultsByYear: YearResult[];
	gross_yield: number; // %
	net_yield: number; // %
	irr: number | null; // decimal e.g. 0.05
	total_investment: number;
}

/**
 * Simulate over a number of years (default 20).
 */
export function simulateProject(
	input: SimulationInput,
	years: number = 20
): SimulationResult {
	const resultsByYear: YearResult[] = [];
	let lmnpReelCf: { deficit: number; depreciation: number } | undefined =
		input.regime === 'LMNP' && input.lmnp_sub_regime === LMNP_SUB_REGIMES.reel_simplifie
			? { deficit: 0, depreciation: 0 }
			: undefined;
	let sciIsDeficitCf: number | undefined =
		input.regime === 'SCI_IS' ? 0 : undefined;

	for (let y = 1; y <= years; y++) {
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
			year: y,
			lmnpReelCarryforwardIn: lmnpReelCf,
			sciIsDeficitCarryforwardIn: sciIsDeficitCf,
			notary_fees: input.notary_fees,
			agency_fees: input.agency_fees,
			lmnp_sub_regime: input.lmnp_sub_regime
		});
		if (cf.lmnpReelCarryforwardOut) {
			lmnpReelCf = cf.lmnpReelCarryforwardOut;
		} else if (cf.sciIsDeficitCarryforwardOut) {
			sciIsDeficitCf = cf.sciIsDeficitCarryforwardOut;
		}
		resultsByYear.push({
			year: y,
			gross_cashflow: cf.gross_cashflow,
			net_cashflow: cf.net_cashflow,
			tax_deductible_deficit: cf.tax_deductible_deficit
		});
	}

	const firstNet = resultsByYear[0]?.net_cashflow ?? 0;
	const totalInv = input.total_investment || 1;
	const gross_yield =
		totalInv > 0 ? (input.annual_rent_gross / totalInv) * 100 : 0;
	const net_yield = totalInv > 0 ? (firstNet / totalInv) * 100 : 0;

	const cashflowsForIrr = [-input.total_investment];
	for (const r of resultsByYear) {
		cashflowsForIrr.push(r.net_cashflow);
	}
	const irrDecimal = irr(cashflowsForIrr);

	return {
		resultsByYear,
		gross_yield,
		net_yield,
		irr: irrDecimal,
		total_investment: input.total_investment
	};
}

export { monthlyPayment, totalInterest, annualLoanPayment } from './loan';
export type { LoanParams } from './loan';
export { annualDepreciationTotal } from './depreciation';
export type { DepreciationRow } from './depreciation';
export { irr } from './irr';
export {
	annualRevenues,
	annualExpenses,
	recoverableCharges,
	taxForRegime,
	taxIS,
	cashflowForYear
} from './cashflow';
export type { RevenueInput, ExpensesInput, LmnpReelCarryforward } from './cashflow';
