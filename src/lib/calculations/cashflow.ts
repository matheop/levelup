/**
 * Revenue, expense, tax and cash-flow calculations by tax regime.
 */

import type { TaxRegimeName } from '$lib/dbTypes';
import { annualDepreciationTotal } from './depreciation';
import type { DepreciationRow } from './depreciation';
import { annualLoanPayment } from './loan';
import type { LoanParams } from './loan';

const DEFICIT_FONCIER_CAP = 10_700; // €/year

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

/**
 * Annual expenses (fixed) + average future works per year.
 */
export function annualExpenses(
	expenses: ExpensesInput,
	futureWorksAnnualAverage: number = 0
): number {
	const fixed =
		expenses.property_tax +
		expenses.co_ownership_fees +
		expenses.management_fees +
		expenses.insurance +
		expenses.utilities +
		expenses.accounting_fees +
		expenses.maintenance_provision;
	return fixed + futureWorksAnnualAverage;
}

/**
 * Tax and social contributions for one year.
 * regime: LMNP | NU | SCI_IS
 * taxableResult: result before tax (after depreciation for LMNP/SCI_IS)
 * returns { tax, socialContributions, deductibleDeficit }
 */
export function taxForRegime(
	regime: TaxRegimeName,
	taxableResult: number,
	socialContributionsRate: number = 0.172,
	isTaxRate: number | null = 0.25 // SCI_IS default
): {
	tax: number;
	socialContributions: number;
	taxDeductibleDeficit: number;
} {
	let tax = 0;
	let taxDeductibleDeficit = 0;

	if (regime === 'NU' && taxableResult < 0) {
		taxDeductibleDeficit = Math.min(-taxableResult, DEFICIT_FONCIER_CAP);
	}
	if (regime === 'SCI_IS' && isTaxRate != null) {
		tax = Math.max(0, taxableResult * isTaxRate);
	}
	const socialContributions =
		regime === 'SCI_IS' ? 0 : Math.max(0, taxableResult * socialContributionsRate);

	return { tax, socialContributions, taxDeductibleDeficit };
}

/**
 * One-year gross cash-flow (before tax) and net cash-flow (after tax).
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
}): { gross_cashflow: number; net_cashflow: number; tax_deductible_deficit: number } {
	const revenues = annualRevenues(params.revenue, params.vacancy_rate);
	const expenses = annualExpenses(params.expenses, params.futureWorksAnnualAverage);
	const loanPayment = annualLoanPayment(params.loanParams);
	const gross_cashflow = revenues - expenses - loanPayment;

	const depreciationTotal = annualDepreciationTotal(params.depreciationRows);
	const deductibleDepreciation =
		params.regime === 'NU' ? 0 : depreciationTotal;
	const taxableResult = gross_cashflow - deductibleDepreciation;

	const { tax, socialContributions, taxDeductibleDeficit } = taxForRegime(
		params.regime,
		taxableResult,
		params.socialContributionsRate,
		params.isTaxRate
	);
	const net_cashflow = gross_cashflow - tax - socialContributions;

	return {
		gross_cashflow,
		net_cashflow,
		tax_deductible_deficit: taxDeductibleDeficit
	};
}
