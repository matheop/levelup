/**
 * Loan calculations: monthly payment, total cost, annual payment.
 * interest_rate: annual rate as decimal (e.g. 0.03 for 3%)
 * loan_deferral_period: months with no principal payment (interest-only or zero)
 */

export interface LoanParams {
	loan_amount: number;
	interest_rate: number;
	loan_duration: number; // years
	loan_deferral_period?: number; // months, default 0
}

/**
 * Monthly payment (principal + interest) for a standard amortizing loan.
 * After deferral period, same payment for the remaining term.
 */
export function monthlyPayment(
	loanAmount: number,
	annualRate: number,
	years: number
): number {
	if (loanAmount <= 0 || years <= 0) return 0;
	const monthlyRate = annualRate / 12;
	const months = years * 12;
	if (monthlyRate <= -1) return 0;
	const factor = Math.pow(1 + monthlyRate, -months);
	if (factor >= 1) return 0;
	return (loanAmount * monthlyRate) / (1 - factor);
}

/**
 * Total interest paid over the life of the loan (no deferral).
 */
export function totalInterest(
	loanAmount: number,
	annualRate: number,
	years: number
): number {
	const monthly = monthlyPayment(loanAmount, annualRate, years);
	return monthly * years * 12 - loanAmount;
}

/**
 * Annual principal + interest payment (12 * monthly).
 * If deferral: during deferral we assume interest-only (loan_amount * rate);
 * after deferral, 12 * monthlyPayment over the remaining months.
 */
export function annualLoanPayment(params: LoanParams): number {
	const {
		loan_amount,
		interest_rate,
		loan_duration,
		loan_deferral_period = 0
	} = params;
	if (loan_amount <= 0) return 0;
	const totalMonths = loan_duration * 12;
	const deferralMonths = Math.min(loan_deferral_period, totalMonths);
	const repaymentMonths = totalMonths - deferralMonths;
	if (repaymentMonths <= 0) {
		// full deferral: only interest
		return loan_amount * interest_rate;
	}
	const monthly = monthlyPayment(loan_amount, interest_rate, loan_duration);
	// Average annual payment over the whole duration (simplified: same payment every year after deferral)
	return monthly * 12;
}

/**
 * Interest portion for a given year (simplified: constant annual interest approx for first years).
 * Used for display; for exact schedule we'd need a full amortization table.
 */
export function approximateAnnualInterest(params: LoanParams): number {
	const { loan_amount, interest_rate } = params;
	return loan_amount * interest_rate;
}

/**
 * Intérêts payés sur une année donnée (année 1 = première année du prêt).
 * Utilisé pour le régime réel LMNP (déduction des intérêts d'emprunt).
 */
export function annualInterestForYear(params: LoanParams, year: number): number {
	const {
		loan_amount,
		interest_rate,
		loan_duration,
		loan_deferral_period = 0
	} = params;
	if (loan_amount <= 0 || year < 1) return 0;
	const totalMonths = loan_duration * 12;
	const deferralMonths = Math.min(loan_deferral_period, totalMonths);
	const monthlyRate = interest_rate / 12;
	let balance = loan_amount;
	const monthlyPay =
		totalMonths > deferralMonths
			? monthlyPayment(loan_amount, interest_rate, loan_duration)
			: 0;
	const startMonth = (year - 1) * 12;
	const endMonth = Math.min(year * 12, totalMonths);
	// Avancer jusqu'au début de l'année demandée
	for (let m = 0; m < startMonth; m++) {
		if (m < deferralMonths) {
			// différé : intérêts seuls, pas de principal
		} else {
			const interest = balance * monthlyRate;
			balance -= monthlyPay - interest;
		}
	}
	// Intérêts sur l'année demandée
	let yearInterest = 0;
	for (let m = startMonth; m < endMonth; m++) {
		if (m < deferralMonths) {
			yearInterest += balance * monthlyRate;
		} else {
			const interest = balance * monthlyRate;
			yearInterest += interest;
			balance -= monthlyPay - interest;
		}
	}
	return yearInterest;
}
