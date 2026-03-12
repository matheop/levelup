import { describe, it, expect } from 'vitest';
import {
	monthlyPayment,
	totalInterest,
	annualLoanPayment
} from './loan';

describe('loan', () => {
	it('computes monthly payment', () => {
		const m = monthlyPayment(200_000, 0.03, 20);
		expect(m).toBeGreaterThan(1100);
		expect(m).toBeLessThan(1200);
	});

	it('total interest over life of loan', () => {
		const i = totalInterest(200_000, 0.03, 20);
		expect(i).toBeGreaterThan(60_000);
		expect(i).toBeLessThan(70_000);
	});

	it('annual loan payment (no deferral)', () => {
		const a = annualLoanPayment({
			loan_amount: 120_000,
			interest_rate: 0.04,
			loan_duration: 15
		});
		expect(a).toBeGreaterThan(10_000);
		expect(a).toBeLessThan(12_000);
	});
});
