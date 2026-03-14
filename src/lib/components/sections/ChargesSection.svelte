<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import type { Charges } from '$lib/domain';

	let { charges } = $props<{
		charges: Charges;
	}>();

	const totalAnnualCharges = $derived(charges.totalAnnualCharges);
	const totalRecoverableCharges = $derived(charges.totalRecoverableCharges);
	const chargesUsedForCalculation = $derived(charges.chargesUsedForCalculation);
</script>

<SectionCard title="Charges" variant="danger" infoContent="Charges annuelles (€/an) : taxe, copro, gestion, assurances, factures, comptabilité, provision entretien.">
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
		<Input label="Taxe foncière (€/an)" id="property-tax" type="number" min={0} bind:value={charges.propertyTax} />
		<Input label="Charges de copropriété (€/an)" id="co-ownership-fees" type="number" min={0} bind:value={charges.coOwnershipFees} />
		<Input label="Gestion locative (€/an)" id="management-fees" type="number" min={0} bind:value={charges.managementFees} />
		<Input label="Assurances (€/an)" id="insurance" type="number" min={0} bind:value={charges.insurance} />
		<Input label="Factures (électricité, eau…) (€/an)" id="utilities" type="number" min={0} bind:value={charges.utilities} />
		<Input label="Honoraires comptables (€/an)" id="accounting-fees" type="number" min={0} bind:value={charges.accountingFees} />
		<Input label="Provision pour entretien (€/an)" id="maintenance-provision" type="number" min={0} bind:value={charges.maintenanceProvision} />
	</div>
	{#snippet footer()}
		<div class="space-y-1 w-full">
			<div class="flex justify-between items-center">
				<span class="font-medium text-slate-700">Total charges annuelles</span>
				<span class="font-semibold text-slate-900"
					>{totalAnnualCharges.toLocaleString('fr-FR')} €</span
				>
			</div>
			<div class="flex justify-between items-center text-sm">
				<span class="text-slate-600">dont récupérables</span>
				<span class="font-semibold text-slate-900"
					>{totalRecoverableCharges.toLocaleString('fr-FR')} €</span
				>
			</div>
			<div class="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
				<span class="text-slate-800">Charges retenues pour le calcul</span>
				<span class="text-lg font-semibold"
					>{chargesUsedForCalculation.toLocaleString('fr-FR')} €</span
				>
			</div>
		</div>
	{/snippet}
</SectionCard>
