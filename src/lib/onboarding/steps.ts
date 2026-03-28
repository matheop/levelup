import { resolve } from '$app/paths';

export const ONBOARDING_STEP_COUNT = 5 as const;

export type OnboardingStepIndex = 1 | 2 | 3 | 4 | 5;

export type OnboardingStepMeta = {
	index: OnboardingStepIndex;
	key: 'project' | 'costs' | 'financing' | 'revenue_charges' | 'future_works';
	progressLabel: string;
	title: string;
};

export const ONBOARDING_STEPS: readonly OnboardingStepMeta[] = [
	{
		index: 1,
		key: 'project',
		progressLabel: 'Projet et fiscalité',
		title: 'Projet et fiscalité'
	},
	{
		index: 2,
		key: 'costs',
		progressLabel: 'Coûts d’investissement',
		title: 'Coûts d’investissement'
	},
	{
		index: 3,
		key: 'financing',
		progressLabel: 'Financement',
		title: 'Financement'
	},
	{
		index: 4,
		key: 'revenue_charges',
		progressLabel: 'Revenus et charges',
		title: 'Revenus et charges'
	},
	{
		index: 5,
		key: 'future_works',
		progressLabel: 'Travaux futurs',
		title: 'Travaux futurs'
	}
] as const;

export function getStepMeta(step: number): OnboardingStepMeta | undefined {
	return ONBOARDING_STEPS.find((s) => s.index === step);
}

/** Parse `step` query : entier 1..N, défaut 1. */
export function parseOnboardingStepParam(raw: string | null): OnboardingStepIndex {
	const n = raw == null || raw === '' ? 1 : Number.parseInt(raw, 10);
	if (!Number.isFinite(n) || n < 1) return 1;
	if (n > ONBOARDING_STEP_COUNT) return ONBOARDING_STEP_COUNT as OnboardingStepIndex;
	return n as OnboardingStepIndex;
}

export function onboardingUrl(step: OnboardingStepIndex): string {
	return `${resolve('/onboarding')}?step=${step}`;
}
