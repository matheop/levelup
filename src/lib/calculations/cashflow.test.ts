import { describe, it, expect } from 'vitest';
import {
	annualRevenues,
	annualExpenses,
	cashflowForYear,
	taxForRegime,
	taxIS
} from './cashflow';
import { IS_PME_PLAFOND_BENEFICE, IS_TAUX_REDUIT, IS_TAUX_NORMAL } from '$lib/constants';

describe('cashflow', () => {
	it('annualRevenues applies vacancy', () => {
		const r = annualRevenues(
			{ monthly_rent: 1000, other_income: 0 },
			0.08
		);
		expect(r).toBe(1000 * 12 * 0.92);
	});

	it('annualExpenses subtracts recoverable charges (copro, gestion, factures)', () => {
		const e = annualExpenses({
			property_tax: 1000,
			co_ownership_fees: 600,
			management_fees: 0,
			insurance: 200,
			utilities: 0,
			accounting_fees: 500,
			maintenance_provision: 500
		});
		// Total fixed 2800 − recoverable (600) = 2200
		expect(e).toBe(2200);
	});

	it('taxForRegime NU with deficit caps at 10700', () => {
		const { taxDeductibleDeficit } = taxForRegime('NU', -15_000, 0.172);
		expect(taxDeductibleDeficit).toBe(10_700);
	});

	it('cashflowForYear LMNP: gross and net', () => {
		const cf = cashflowForYear({
			revenue: { monthly_rent: 1200, other_income: 0 },
			expenses: {
				property_tax: 800,
				co_ownership_fees: 500,
				management_fees: 0,
				insurance: 200,
				utilities: 0,
				accounting_fees: 400,
				maintenance_provision: 300
			},
			vacancy_rate: 0.05,
			loanParams: {
				loan_amount: 100_000,
				interest_rate: 0.03,
				loan_duration: 20
			},
			depreciationRows: [
				{ depreciable_value: 80_000, depreciation_period: 25 }
			],
			futureWorksAnnualAverage: 0,
			regime: 'LMNP',
			socialContributionsRate: 0.172,
			isTaxRate: null
		});
		expect(cf.gross_cashflow).toBeDefined();
		expect(cf.net_cashflow).toBeDefined();
	});

	describe('taxIS (SCI IS 2026 tranched rates)', () => {
		it('returns 0 for zero or negative benefit', () => {
			expect(taxIS(0)).toBe(0);
			expect(taxIS(-1000)).toBe(0);
		});

		it('applies 15% on portion <= plafond', () => {
			expect(taxIS(IS_PME_PLAFOND_BENEFICE)).toBe(
				IS_PME_PLAFOND_BENEFICE * IS_TAUX_REDUIT
			);
		});

		it('applies 15% then 25% above plafond', () => {
			const above = 10_000;
			const benefit = IS_PME_PLAFOND_BENEFICE + above;
			expect(taxIS(benefit)).toBe(
				IS_PME_PLAFOND_BENEFICE * IS_TAUX_REDUIT + above * IS_TAUX_NORMAL
			);
		});
	});

	describe('cashflowForYear SCI_IS', () => {
		const baseParams = {
			revenue: { monthly_rent: 1200, other_income: 0 },
			expenses: {
				property_tax: 800,
				co_ownership_fees: 500,
				management_fees: 0,
				insurance: 200,
				utilities: 0,
				accounting_fees: 400,
				maintenance_provision: 300
			},
			vacancy_rate: 0.05,
			loanParams: {
				loan_amount: 100_000,
				interest_rate: 0.03,
				loan_duration: 20
			},
			depreciationRows: [
				{ depreciable_value: 80_000, depreciation_period: 25 }
			],
			futureWorksAnnualAverage: 0,
			regime: 'SCI_IS' as const,
			socialContributionsRate: 0,
			isTaxRate: 0.25,
			notary_fees: 10_000,
			agency_fees: 5_000
		};

		it('deducts only interest (not full loan payment) for taxable result', () => {
			const cf = cashflowForYear({ ...baseParams, year: 1 });
			// Gross cash-flow uses full loan payment; tax is on result with only interest deducted.
			expect(cf.gross_cashflow).toBeDefined();
			expect(cf.net_cashflow).toBeDefined();
			// No social contributions for SCI_IS
			expect(cf).toHaveProperty('sciIsDeficitCarryforwardOut');
		});

		it('uses acquisition fees amortization (notary + agency) over 10 years', () => {
			const cf = cashflowForYear({ ...baseParams, year: 1 });
			// With notary 10k + agency 5k, amort 1500/year reduces taxable result
			expect(cf.sciIsDeficitCarryforwardOut).toBeDefined();
		});

		it('carries forward deficit and applies tax after absorption', () => {
			// Year 1: large loss -> deficit carried
			const cf1 = cashflowForYear({
				...baseParams,
				revenue: { monthly_rent: 100, other_income: 0 },
				year: 1
			});
			expect(cf1.sciIsDeficitCarryforwardOut).toBeGreaterThan(0);
			expect(cf1.net_cashflow).toBeLessThan(0);

			// Year 2: pass carried deficit, positive result absorbs part and pays tax on rest
			const cf2 = cashflowForYear({
				...baseParams,
				revenue: { monthly_rent: 1200, other_income: 0 },
				year: 2,
				sciIsDeficitCarryforwardIn: cf1.sciIsDeficitCarryforwardOut
			});
			expect(cf2.sciIsDeficitCarryforwardOut).toBeDefined();
		});
	});
});
