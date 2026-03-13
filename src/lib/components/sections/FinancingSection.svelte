<script lang="ts">
	import { monthlyPayment } from '$lib/calculations';
	import FormField from '$lib/components/form/FormField.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import type { FinancingSectionState } from './sectionTypes';

	let { financing = $bindable(), totalProjectCost } = $props<{
		financing: FinancingSectionState;
		totalProjectCost: number;
	}>();

	const personalContribution = $derived(totalProjectCost - financing.loanAmount);

	const monthlyWithoutInsurance = $derived(
		financing.loanAmount > 0 && financing.loanDuration > 0
			? monthlyPayment(financing.loanAmount, financing.interestRate, financing.loanDuration)
			: 0
	);
	const monthlyWithInsurance = $derived(
		monthlyWithoutInsurance + (financing.loanInsuranceMonthly || 0)
	);
	const annualLoanCost = $derived(monthlyWithInsurance * 12);
</script>

<SectionCard title="Financement">
	<div class="mb-4 max-w-xs">
		<StatCard
			label="Apport personnel (€)"
			value={personalContribution.toLocaleString('fr-FR') + ' €'}
			sublabel="Coût total du projet − montant emprunté"
			size="lg"
			trend="neutral"
		/>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<FormField id="loan-amount" label="Montant emprunté (€)">
			<Input id="loan-amount" type="number" min={0} bind:value={financing.loanAmount} />
		</FormField>
		<FormField id="interest-rate" label="Taux annuel (ex: 0.034)">
			<Input id="interest-rate" type="number" step={0.001} min={0} bind:value={financing.interestRate} />
		</FormField>
		<FormField id="loan-duration" label="Durée (années)">
			<Input id="loan-duration" type="number" min={1} bind:value={financing.loanDuration} />
		</FormField>
		<FormField id="loan-deferral" label="Différé (mois)">
			<Input id="loan-deferral" type="number" min={0} bind:value={financing.loanDeferralMonths} />
		</FormField>
		<FormField id="loan-insurance" label="Assurance emprunteur (€/mois)">
			<Input
				id="loan-insurance"
				type="number"
				min={0}
				step={0.01}
				bind:value={financing.loanInsuranceMonthly}
			/>
		</FormField>
	</div>
	<div class="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
			trend="neutral"
		/>
		<StatCard
			label="Coût crédit (€/an)"
			value={annualLoanCost.toLocaleString('fr-FR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}) + ' €'}
			size="sm"
			trend="neutral"
		/>
	</div>
</SectionCard>
