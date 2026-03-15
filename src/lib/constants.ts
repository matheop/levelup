export const LMNP_TAX_ALLOWANCE_RATE = 0.5;

export const LMNP_SUB_REGIMES = {
	micro_bic: 'micro_bic',
	reel_simplifie: 'reel_simplifie'
} as const;
/** Sous-régime LMNP : micro-BIC (abattement 50 %) ou régime réel simplifié (amortissement, déficit reportable). */
export type LmnpSubRegime = (typeof LMNP_SUB_REGIMES)[keyof typeof LMNP_SUB_REGIMES];
