import type { PageLoad } from './$types';
import { parseOnboardingStepParam } from '$lib/onboarding/steps';

export const load: PageLoad = ({ url }) => {
	const step = parseOnboardingStepParam(url.searchParams.get('step'));
	return { step };
};
