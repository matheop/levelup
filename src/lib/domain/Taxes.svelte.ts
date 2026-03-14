export type TaxBracketRate = 0 | 0.11 | 0.3 | 0.41 | 0.45;

/**
 * Paramètres fiscaux : tranche marginale IR, prélèvements sociaux.
 */
export class Taxes {
	taxBracketRate = $state<TaxBracketRate>(0);
	socialContributionsRate = $state(0);

	constructor(init?: Partial<Pick<Taxes, 'taxBracketRate' | 'socialContributionsRate'>>) {
		if (init?.taxBracketRate != null) this.taxBracketRate = init.taxBracketRate;
		if (init?.socialContributionsRate != null)
			this.socialContributionsRate = init.socialContributionsRate;
	}
}
