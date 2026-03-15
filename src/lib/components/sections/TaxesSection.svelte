<script lang="ts">
	import Select from '$lib/components/form/Select.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import type { Taxes } from '$lib/domain';
	import type { SimulationResult, YearResult } from '$lib/calculations';
	import { getTaxesInfoContent } from './taxesSectionInfo';
	import { LMNP_TAX_ALLOWANCE_RATE } from '$lib/constants';
	import { LMNP_SUB_REGIMES, type LmnpSubRegime } from '$lib/constants';

	let {
		taxes,
		taxRegime,
		lmnpSubRegime = LMNP_SUB_REGIMES.reel_simplifie,
		annualRevenueAfterVacancy = 0,
		simulationResult,
		embedded = false,
	} = $props<{
		taxes: Taxes;
		taxRegime: 'LMNP' | 'NU' | 'SCI_IS';
		lmnpSubRegime?: LmnpSubRegime;
		annualRevenueAfterVacancy?: number;
		simulationResult: SimulationResult | null;
		embedded?: boolean;
	}>();

	const firstYearResult = $derived(simulationResult?.resultsByYear[0]);

	// Tranches marginales IR typiques (taux en décimal)
	const bracketOptions = [
		{ value: '0.11', label: '11 %' },
		{ value: '0.30', label: '30 %' },
		{ value: '0.41', label: '41 %' },
		{ value: '0.45', label: '45 %' }
	];

	let taxBracketStr = $derived(
		(taxes.taxBracketRate ?? 0.3).toFixed(2)
	);

	$effect(() => {
		const num = parseFloat(taxBracketStr);
		if (!Number.isNaN(num) && num >= 0 && num <= 1 && num !== taxes.taxBracketRate) {
			taxes.taxBracketRate = num;
		}
	});


	// Micro : coût annuel = base abattue × (tranche + PS)
	const taxableBaseMicro = $derived(Math.max(0, annualRevenueAfterVacancy * LMNP_TAX_ALLOWANCE_RATE));
	const annualTaxCostMicro = $derived(
		taxableBaseMicro * (taxes.taxBracketRate + taxes.socialContributionsRate)
	);

	// Première année où impôts + PS > 0 (pour LMNP régime réel)
	const firstYearWithTax = $derived.by(() => {
		const rows = simulationResult?.resultsByYear ?? [];
		const found = rows.find(
			(r: YearResult) => r.gross_cashflow - r.net_cashflow > 0.01
		);
		return found != null ? found.year : null;
	});
	const firstYearTaxAmount = $derived.by(() => {
		if (firstYearWithTax == null) return null;
		const row = simulationResult?.resultsByYear?.find(
			(r: YearResult) => r.year === firstYearWithTax
		);
		return row != null ? row.gross_cashflow - row.net_cashflow : null;
	});

	const firstYearTaxAndPs = $derived(
		firstYearResult != null
			? firstYearResult.gross_cashflow - firstYearResult.net_cashflow
			: null
	);

	const infoContent = $derived(
		getTaxesInfoContent(
			{
				taxBracketRate: taxes.taxBracketRate,
				socialContributionsRate: taxes.socialContributionsRate
			},
			lmnpSubRegime
		)
	);
	const isMicro = $derived(lmnpSubRegime === 'micro_bic');
</script>

{#if taxRegime === 'LMNP'}
	{#if embedded}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Select label="Tranche marginale d'imposition (IR)" id="tax-bracket-emb" bind:value={taxBracketStr} options={bracketOptions} />
			<div class="flex flex-col justify-end">
				<p class="text-sm text-slate-600">Prélèvements sociaux</p>
				<p class="font-semibold text-slate-800">{(taxes.socialContributionsRate * 100).toFixed(1)} %</p>
				<p class="text-xs text-slate-500">Taux 2026 (fixe)</p>
			</div>
		</div>
		{#if isMicro}
			<div class="mt-3 pt-3 border-t border-slate-200">
				<p class="text-sm text-slate-600">Abattement forfaitaire : <strong>50 %</strong> (LMLD).</p>
			</div>
		{/if}
		<div class="mt-4 pt-3 border-t border-slate-200 space-y-1 w-full">
			<div class="flex justify-between items-center w-full">
				<span class="font-medium text-slate-700">{isMicro ? 'Coût annuel (impôts + PS)' : 'Coût année 1 (impôts + PS)'}</span>
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
	{:else}
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
{/if}
