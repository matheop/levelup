import { LMNP_SUB_REGIMES } from '$lib/constants';
import type { ProjectUserInputs } from '$lib/domain/Project.svelte';

/** Payload initial pour l’assistant (vacance 0,8 %, reste aligné sur un brouillon vide). */
export function createOnboardingInitialPayload(): ProjectUserInputs {
	return {
		projectName: 'Mon projet',
		projectType: 'purchase',
		taxRegime: 'LMNP',
		lmnpSubRegime: LMNP_SUB_REGIMES.reel_simplifie,
		cost: {
			purchasePrice: 0,
			notaryFees: 0,
			agencyFees: 0,
			renovationCost: 0,
			furnitureCost: 0,
			bankFees: 0
		},
		financings: [
			{
				loanAmount: 0,
				interestRate: 0,
				loanDuration: 20,
				loanDeferralMonths: 0,
				loanInsuranceMonthly: 0
			}
		],
		revenue: {
			rents: [{ monthly_amount: 0 }],
			otherIncomes: [],
			vacancyRate: 0.008
		},
		charges: {
			propertyTax: 0,
			coOwnershipFees: 0,
			managementFees: 0,
			insurance: 0,
			utilities: 0,
			accountingFees: 0,
			maintenanceProvision: 0
		},
		taxes: {
			taxBracketRate: 0.3,
			socialContributionsRate: 0.186
		},
		futureWorks: [
			{
				work_type: '',
				estimated_cost: 0,
				planned_year: 0,
				frequency_years: 0
			}
		]
	};
}
