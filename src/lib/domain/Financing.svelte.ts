import {
	monthlyPayment as loanMonthlyPayment,
	totalInterest as loanTotalInterest
} from '$lib/calculations';
import type { LoanParams } from '$lib/calculations';

/**
 * Un financement (prêt) : montant, taux, durée, différé, assurance.
 * Méthodes de calcul déléguées à $lib/calculations/loan.
 */
export class Financing {
	id = $state(crypto.randomUUID());
	loanAmount = $state(0);
	interestRate = $state(0);
	loanDuration = $state(0);
	loanDeferralMonths = $state(0);
	loanInsuranceMonthly = $state(0);

	constructor(
		init?: Partial<
			Pick<
				Financing,
				'loanAmount' | 'interestRate' | 'loanDuration' | 'loanDeferralMonths' | 'loanInsuranceMonthly'
			>
		>
	) {
		if (init) {
			if (init.loanAmount != null) this.loanAmount = init.loanAmount;
			if (init.interestRate != null) this.interestRate = init.interestRate;
			if (init.loanDuration != null) this.loanDuration = init.loanDuration;
			if (init.loanDeferralMonths != null) this.loanDeferralMonths = init.loanDeferralMonths;
			if (init.loanInsuranceMonthly != null) this.loanInsuranceMonthly = init.loanInsuranceMonthly;
		}
	}

	monthlyPayment(): number {
		return this.loanAmount > 0 && this.loanDuration > 0
			? loanMonthlyPayment(this.loanAmount, this.interestRate, this.loanDuration)
			: 0;
	}

	totalInterest(): number {
		return this.loanAmount > 0 && this.loanDuration > 0
			? loanTotalInterest(this.loanAmount, this.interestRate, this.loanDuration)
			: 0;
	}

	totalInsuranceCost(): number {
		return (this.loanInsuranceMonthly || 0) * 12 * this.loanDuration;
	}

	creditInterestTotal(): number {
		return this.totalInterest() + this.totalInsuranceCost();
	}

	toLoanParams(): LoanParams {
		return {
			loan_amount: this.loanAmount,
			interest_rate: this.interestRate,
			loan_duration: this.loanDuration,
			loan_deferral_period: this.loanDeferralMonths
		};
	}
}
