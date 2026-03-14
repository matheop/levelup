<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import Sumup from '../layout/Sumup.svelte';
	import type { Financing } from '$lib/domain';

	let { financing, totalProjectCost, totalProjectCostWithInterest, embedded = false } = $props<{
		financing: Financing;
		totalProjectCost: number;
		totalProjectCostWithInterest: number;
		embedded?: boolean;
	}>();

	const personalContribution = $derived(totalProjectCost - financing.loanAmount);
	const creditInterestTotal = $derived(financing.creditInterestTotal());
	const monthlyWithoutInsurance = $derived(financing.monthlyPayment());
	const monthlyWithInsurance = $derived(
		monthlyWithoutInsurance + (financing.loanInsuranceMonthly || 0)
	);
	const annualLoanCost = $derived(monthlyWithInsurance * 12);
</script>

{#if embedded}
	<div class="mb-4 max-w-xs">
		<StatCard
			label="Apport personnel (€)"
			value={personalContribution.toLocaleString('fr-FR') + ' €'}
			sublabel="Coût total du projet − montant emprunté"
			size="sm"
			trend="neutral"
		/>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<Input label="Montant emprunté (€)" id="loan-amount-emb" type="number" min={0} bind:value={financing.loanAmount} />
		<Input label="Taux annuel (ex: 0.034)" id="interest-rate-emb" type="number" step={0.001} min={0} bind:value={financing.interestRate} />
		<Input label="Durée (années)" id="loan-duration-emb" type="number" min={1} bind:value={financing.loanDuration} />
		<Input label="Différé (mois)" id="loan-deferral-emb" type="number" min={0} bind:value={financing.loanDeferralMonths} />
		<Input label="Assurance emprunteur (€/mois)" id="loan-insurance-emb" type="number" min={0} step={0.01} bind:value={financing.loanInsuranceMonthly} />
	</div>
	<div class="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
		<StatCard
			label="Mensualité hors assurance"
			value={monthlyWithoutInsurance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'}
			size="sm"
			trend="neutral"
		/>
		<StatCard
			label="Mensualité avec assurance"
			value={monthlyWithInsurance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'}
			size="sm"
			trend="info"
		/>
	</div>
	<div class="border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
		<StatCard
			label="Coût crédit (€/an)"
			value={annualLoanCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'}
			size="sm"
			trend="neutral"
		/>
		<StatCard
			label="Coût total du crédit – intérêts + assurance (€)"
			value={creditInterestTotal.toLocaleString('fr-FR') + ' €'}
			size="sm"
			trend="info"
		/>
	</div>
	<div class="mt-4 pt-3 border-t border-slate-200">
		<Sumup title="Coût total projet" cost={totalProjectCostWithInterest} />
	</div>
{:else}
<SectionCard title="Financement">
	<div class="mb-4 max-w-xs">
		<StatCard
			label="Apport personnel (€)"
			value={personalContribution.toLocaleString('fr-FR') + ' €'}
			sublabel="Coût total du projet − montant emprunté"
			size="sm"
			trend="neutral"
		/>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<Input label="Montant emprunté (€)" id="loan-amount" type="number" min={0} bind:value={financing.loanAmount} />
		<Input label="Taux annuel (ex: 0.034)" id="interest-rate" type="number" step={0.001} min={0} bind:value={financing.interestRate} />
		<Input label="Durée (années)" id="loan-duration" type="number" min={1} bind:value={financing.loanDuration} />
		<Input label="Différé (mois)" id="loan-deferral" type="number" min={0} bind:value={financing.loanDeferralMonths} />
		<Input label="Assurance emprunteur (€/mois)" id="loan-insurance" type="number" min={0} step={0.01} bind:value={financing.loanInsuranceMonthly} />
	</div>
	<div class="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
		<StatCard
			label="Mensualité hors assurance"
			value={monthlyWithoutInsurance.toLocaleString('fr-FR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}) + ' €'}
			size="sm"
			trend="neutral"
		/>
		<StatCard
			label="Mensualité avec assurance"
			value={monthlyWithInsurance.toLocaleString('fr-FR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}) + ' €'}
			size="sm"
			trend="info"
		/>
	</div>
	<div class="border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
		<StatCard
			label="Coût crédit (€/an)"
			value={annualLoanCost.toLocaleString('fr-FR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}) + ' €'}
			size="sm"
			trend="neutral"
		/>
		<StatCard
			label="Coût total du crédit – intérêts + assurance (€)"
			value={creditInterestTotal.toLocaleString('fr-FR') + ' €'}
			size="sm"
			trend="info"
		/>
	</div>

	{#snippet footer()}
		<Sumup title="Coût total projet" cost={totalProjectCostWithInterest} />
	{/snippet}
</SectionCard>
{/if}
