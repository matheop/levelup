import { describe, it, expect } from 'vitest';
import {
	annualRevenues,
	annualExpenses,
	cashflowForYear,
	taxForRegime
} from './cashflow';

describe('cashflow', () => {
	it('annualRevenues applies vacancy', () => {
		const r = annualRevenues(
			{ monthly_rent: 1000, other_income: 0 },
			0.08
		);
		expect(r).toBe(1000 * 12 * 0.92);
	});

	it('annualExpenses sums fixed costs', () => {
		const e = annualExpenses({
			property_tax: 1000,
			co_ownership_fees: 600,
			management_fees: 0,
			insurance: 200,
			utilities: 0,
			accounting_fees: 500,
			maintenance_provision: 500
		});
		expect(e).toBe(2800);
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
});
