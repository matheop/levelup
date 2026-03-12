/**
 * IRR (Internal Rate of Return) via Newton-Raphson.
 * cashflows[0] = initial investment (negative), cashflows[1..n] = yearly flows.
 */

const MAX_ITER = 100;
const TOL = 1e-7;

function npv(rate: number, cashflows: number[]): number {
	let sum = 0;
	for (let i = 0; i < cashflows.length; i++) {
		sum += cashflows[i] / Math.pow(1 + rate, i);
	}
	return sum;
}

function npvDerivative(rate: number, cashflows: number[]): number {
	let sum = 0;
	for (let i = 0; i < cashflows.length; i++) {
		sum -= (i * cashflows[i]) / Math.pow(1 + rate, i + 1);
	}
	return sum;
}

/**
 * Returns IRR as decimal (e.g. 0.05 for 5%) or null if no convergence.
 */
export function irr(cashflows: number[]): number | null {
	if (cashflows.length < 2) return null;
	let rate = 0.1;
	for (let iter = 0; iter < MAX_ITER; iter++) {
		const value = npv(rate, cashflows);
		if (Math.abs(value) < TOL) return rate;
		const deriv = npvDerivative(rate, cashflows);
		if (Math.abs(deriv) < 1e-15) break;
		rate = rate - value / deriv;
		if (rate <= -1) rate = -0.99;
		if (rate > 10) rate = 2;
	}
	return null;
}
