export const LMNP_TAX_ALLOWANCE_RATE = 0.5;

/** SCI à l'IS 2026 (PME) : plafond de bénéfice pour le taux réduit 15 %. */
export const IS_PME_PLAFOND_BENEFICE = 42_500;
/** SCI à l'IS 2026 : taux réduit pour la part des bénéfices ≤ plafond. */
export const IS_TAUX_REDUIT = 0.15;
/** SCI à l'IS 2026 : taux normal au-delà du plafond. */
export const IS_TAUX_NORMAL = 0.25;

export const LMNP_SUB_REGIMES = {
	micro_bic: 'micro_bic',
	reel_simplifie: 'reel_simplifie'
} as const;
/** Sous-régime LMNP : micro-BIC (abattement 50 %) ou régime réel simplifié (amortissement, déficit reportable). */
export type LmnpSubRegime = (typeof LMNP_SUB_REGIMES)[keyof typeof LMNP_SUB_REGIMES];
