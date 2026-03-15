import type { Taxes } from '$lib/domain';
import { LMNP_TAX_ALLOWANCE_RATE, IS_PME_PLAFOND_BENEFICE } from '$lib/constants';
import type { LmnpSubRegime } from '$lib/constants';
import type { TaxRegimeName } from '$lib/dbTypes';

const EXAMPLE_REVENUE = 10_000;

export function getTaxesInfoContent(
	taxes: Taxes,
	lmnpSubRegime: LmnpSubRegime,
	taxRegime?: TaxRegimeName
): string {
	if (taxRegime === 'SCI_IS') {
		return [
			'<strong>SCI à l’impôt sur les sociétés (IS) – 2026</strong>',
			'',
			'• Impôt sur les sociétés uniquement (pas de prélèvements sociaux au niveau de la société).',
			'• Taux tranché PME : 15 % sur la part des bénéfices ≤ ' +
				IS_PME_PLAFOND_BENEFICE.toLocaleString('fr-FR') +
				' €, puis 25 % au-delà.',
			"• Déduction des charges, des intérêts d'emprunt (seuls, pas le capital), des frais d'acquisition amortis sur 10 ans et de l'amortissement du bien.",
			'• Report de déficit illimité en avant.'
		].join('\n');
	}

	const rev = EXAMPLE_REVENUE;
	const baseLmnp = rev * LMNP_TAX_ALLOWANCE_RATE;
	const irLmnp = baseLmnp * taxes.taxBracketRate;
	const psLmnp = baseLmnp * taxes.socialContributionsRate;
	const totalLmnp = irLmnp + psLmnp;

	if (lmnpSubRegime === 'micro_bic') {
		return [
			'<strong>LMNP micro-BIC – location meublée longue durée</strong>',
			'',
			'• Abattement forfaitaire 50 % sur les revenus (pas de déduction des charges).',
			'• Base imposable = revenus annuels (après vacance) × 50 %.',
			'• Impôt sur le revenu = base × tranche marginale.',
			'• Prélèvements sociaux = base × ' +
				(taxes.socialContributionsRate * 100).toFixed(1) +
				' % (taux 2026).',
			'',
			'<strong>Exemple de calcul</strong>',
			`Revenus annuels retenus : ${rev.toLocaleString('fr-FR')} €`,
			`Base après abattement 50 % : ${rev.toLocaleString('fr-FR')} × 50 % = ${baseLmnp.toLocaleString('fr-FR')} €`,
			`IR (tranche ${(taxes.taxBracketRate * 100).toFixed(0)} %) : ${baseLmnp.toLocaleString('fr-FR')} × ${(taxes.taxBracketRate * 100).toFixed(0)} % = ${irLmnp.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`,
			`PS (${(taxes.socialContributionsRate * 100).toFixed(1)} %) : ${baseLmnp.toLocaleString('fr-FR')} × ${(taxes.socialContributionsRate * 100).toFixed(1)} % = ${psLmnp.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`,
			`<strong>Total impôts + PS : ${totalLmnp.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong>`
		].join('\n');
	}

	return [
		'<strong>LMNP régime réel simplifié</strong>',
		'',
		'• Déduction des charges annuelles (taxe, copro, gestion, assurances, etc.) et de la moyenne des travaux futurs.',
		"• Déduction des frais d'acquisition (notaire + frais agence) amortis sur 10 ans.",
		"• Déduction des intérêts d'emprunt (année par année).",
		'• Déficit reportable sur les bénéfices des 10 années suivantes.',
		"• Amortissement du bien et des meubles déductible dans la limite du résultat positif (l'excédent est reporté ; il ne peut pas créer ou creuser un déficit).",
		'• Impôt sur le revenu = résultat imposable × tranche marginale.',
		'• Prélèvements sociaux = résultat imposable × ' +
			(taxes.socialContributionsRate * 100).toFixed(1) +
			' % (taux 2026).'
	].join('\n');
}
