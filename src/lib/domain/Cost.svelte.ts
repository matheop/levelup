import type { ProjectType } from '$lib/components/sections/sectionTypes';

/**
 * Coûts du projet : achat, notaire, agence, travaux, meubles, frais bancaires.
 * Champs réactifs ($state) pour usage dans les composants Svelte.
 */
export class Cost {
	purchasePrice = $state(0);
	notaryFees = $state(0);
	agencyFees = $state(0);
	renovationCost = $state(0);
	furnitureCost = $state(0);
	bankFees = $state(0);

	constructor(init?: Partial<Pick<Cost, 'purchasePrice' | 'notaryFees' | 'agencyFees' | 'renovationCost' | 'furnitureCost' | 'bankFees'>>) {
		if (init) {
			if (init.purchasePrice != null) this.purchasePrice = init.purchasePrice;
			if (init.notaryFees != null) this.notaryFees = init.notaryFees;
			if (init.agencyFees != null) this.agencyFees = init.agencyFees;
			if (init.renovationCost != null) this.renovationCost = init.renovationCost;
			if (init.furnitureCost != null) this.furnitureCost = init.furnitureCost;
			if (init.bankFees != null) this.bankFees = init.bankFees;
		}
	}

	/** Total coûts projet (hors intérêts) selon le type de projet. */
	totalProjectCost(projectType: ProjectType): number {
		const acquisition =
			projectType === 'purchase'
				? this.purchasePrice + this.notaryFees + (this.agencyFees ?? 0)
				: 0;
		return (
			acquisition +
			this.renovationCost +
			(this.furnitureCost || 0) +
			this.bankFees
		);
	}
}
