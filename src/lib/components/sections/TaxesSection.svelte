<script lang="ts">
	import Select from '$lib/components/form/Select.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import type { TaxesSectionState } from './sectionTypes';

	const LMNP_ABATTEMENT = 0.5; // 50 % LMLD
	const EXAMPLE_REVENUE = 10_000;

	let {
		taxes = $bindable(),
		taxRegime,
		lmnpSubRegime = 'regime_reel_simplifie',
		annualRevenueAfterVacancy = 0,
		/** Coût IR + PS année 1 (régime réel uniquement, depuis la simulation). */
		firstYearTaxAndPs = null,
		/** Première année où impôts + PS > 0 (régime réel). */
		firstYearWithTax = null,
		/** Montant IR + PS cette année-là. */
		firstYearTaxAmount = null
	} = $props<{
		taxes: TaxesSectionState;
		taxRegime: 'LMNP' | 'NU' | 'SCI_IS';
		lmnpSubRegime?: 'micro_bic' | 'regime_reel_simplifie';
		annualRevenueAfterVacancy?: number;
		firstYearTaxAndPs?: number | null;
		firstYearWithTax?: number | null;
		firstYearTaxAmount?: number | null;
	}>();

	// Tranches marginales IR typiques (taux en décimal)
	const bracketOptions = [
		{ value: '0.11', label: '11 %' },
		{ value: '0.30', label: '30 %' },
		{ value: '0.41', label: '41 %' },
		{ value: '0.45', label: '45 %' }
	];

	let taxBracketStr = $state((taxes.taxBracketRate ?? 0.3).toFixed(2));
	$effect(() => {
		const num = parseFloat(taxBracketStr);
		if (!Number.isNaN(num) && num >= 0 && num <= 1) {
			taxes.taxBracketRate = num;
		}
	});

	const rev = EXAMPLE_REVENUE;
	const baseLmnp = $derived(rev * LMNP_ABATTEMENT);
	const irLmnp = $derived(baseLmnp * taxes.taxBracketRate);
	const psLmnp = $derived(baseLmnp * taxes.socialContributionsRate);
	const totalLmnp = $derived(irLmnp + psLmnp);

	// Micro : coût annuel = base abattue × (tranche + PS)
	const taxableBaseMicro = $derived(Math.max(0, annualRevenueAfterVacancy * LMNP_ABATTEMENT));
	const annualTaxCostMicro = $derived(
		taxableBaseMicro * (taxes.taxBracketRate + taxes.socialContributionsRate)
	);

	const infoContentMicro = $derived(
		[
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
		].join('\n')
	);

	const infoContentReel = $derived(
		[
			'<strong>LMNP régime réel simplifié</strong>',
			'',
			'• Déduction des charges annuelles (taxe, copro, gestion, assurances, etc.) et de la moyenne des travaux futurs.',
			'• Déduction des frais d\'acquisition (notaire + frais agence) amortis sur 10 ans.',
			'• Déduction des intérêts d\'emprunt (année par année).',
			'• Déficit reportable sur les bénéfices des 10 années suivantes.',
			'• Amortissement du bien et des meubles déductible dans la limite du résultat positif (l\'excédent est reporté ; il ne peut pas créer ou creuser un déficit).',
			'• Impôt sur le revenu = résultat imposable × tranche marginale.',
			'• Prélèvements sociaux = résultat imposable × ' +
				(taxes.socialContributionsRate * 100).toFixed(1) +
				' % (taux 2026).'
		].join('\n')
	);

	const infoContent = $derived(
		lmnpSubRegime === 'micro_bic' ? infoContentMicro : infoContentReel
	);
	const isMicro = $derived(lmnpSubRegime === 'micro_bic');
</script>

{#if taxRegime === 'LMNP'}
	<SectionCard title="Impôts et prélèvements" infoContent={infoContent}>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Select label="Tranche marginale d'imposition (IR)" id="tax-bracket" bind:value={taxBracketStr} options={bracketOptions} />
			<div class="flex flex-col justify-end">
				<p class="text-sm text-slate-600">Prélèvements sociaux</p>
				<p class="font-semibold text-slate-800">
					{(taxes.socialContributionsRate * 100).toFixed(1)} %
				</p>
				<p class="text-xs text-slate-500">Taux 2026 (fixe)</p>
			</div>
		</div>
		{#if isMicro}
			<div class="mt-3 pt-3 border-t border-slate-200">
				<p class="text-sm text-slate-600">
					Abattement forfaitaire : <strong>50 %</strong> (LMLD).
				</p>
			</div>
		{/if}
		{#snippet footer()}
			<div class="space-y-1 w-full">
				<div class="flex justify-between items-center w-full">
					<span class="font-medium text-slate-700">
						{isMicro ? 'Coût annuel (impôts + PS)' : 'Coût année 1 (impôts + PS)'}
					</span>
					<span class="text-lg font-semibold text-slate-900">
						{#if isMicro}
							{annualTaxCostMicro.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
						{:else if firstYearTaxAndPs != null}
							{firstYearTaxAndPs.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
						{:else}
							–
						{/if}
					</span>
				</div>
				{#if !isMicro && (firstYearWithTax != null || firstYearTaxAmount != null)}
					<div class="flex justify-between items-center w-full text-sm">
						<span class="text-slate-600">Première année d'imposition</span>
						<span class="font-semibold text-slate-900">
							{#if firstYearWithTax != null && firstYearTaxAmount != null}
								Année {firstYearWithTax} ({firstYearTaxAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)
							{:else if firstYearWithTax != null}
								Année {firstYearWithTax}
							{:else}
								Aucune sur la période simulée
							{/if}
						</span>
					</div>
				{:else if !isMicro}
					<div class="flex justify-between items-center w-full text-sm">
						<span class="text-slate-600">Première année d'imposition</span>
						<span class="text-slate-500">Aucune sur la période simulée</span>
					</div>
				{/if}
			</div>
		{/snippet}
	</SectionCard>
{/if}
