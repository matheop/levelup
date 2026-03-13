<script lang="ts">
	import FormField from '$lib/components/form/FormField.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import type { ChargesSectionState } from './sectionTypes';

	let { charges = $bindable() } = $props<{
		charges: ChargesSectionState;
	}>();

	const totalAnnualCharges = $derived(
		charges.propertyTax +
			charges.coOwnershipFees +
			charges.managementFees +
			charges.insurance +
			charges.utilities +
			charges.accountingFees +
			charges.maintenanceProvision
	);
	const totalRecoverableCharges = $derived(
		charges.coOwnershipFees + charges.managementFees + charges.utilities
	);
	const chargesUsedForCalculation = $derived(totalAnnualCharges - totalRecoverableCharges);
</script>

<SectionCard title="Charges" variant="danger" infoContent="Charges annuelles (€/an) : taxe, copro, gestion, assurances, factures, comptabilité, provision entretien.">
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
		<FormField id="property-tax" label="Taxe foncière (€/an)">
			<Input id="property-tax" type="number" min={0} bind:value={charges.propertyTax} />
		</FormField>
		<FormField id="co-ownership-fees" label="Charges de copropriété (€/an)">
			<Input id="co-ownership-fees" type="number" min={0} bind:value={charges.coOwnershipFees} />
		</FormField>
		<FormField id="management-fees" label="Gestion locative (€/an)">
			<Input id="management-fees" type="number" min={0} bind:value={charges.managementFees} />
		</FormField>
		<FormField id="insurance" label="Assurances (€/an)">
			<Input id="insurance" type="number" min={0} bind:value={charges.insurance} />
		</FormField>
		<FormField id="utilities" label="Factures (électricité, eau…) (€/an)">
			<Input id="utilities" type="number" min={0} bind:value={charges.utilities} />
		</FormField>
		<FormField id="accounting-fees" label="Honoraires comptables (€/an)">
			<Input id="accounting-fees" type="number" min={0} bind:value={charges.accountingFees} />
		</FormField>
		<FormField id="maintenance-provision" label="Provision pour entretien (€/an)">
			<Input
				id="maintenance-provision"
				type="number"
				min={0}
				bind:value={charges.maintenanceProvision}
			/>
		</FormField>
	</div>
	{#snippet footer()}
		<div class="space-y-1 w-full">
			<div class="flex justify-between items-center">
				<span class="font-medium text-slate-700">Total charges annuelles</span>
				<span class="text-lg font-semibold text-slate-900"
					>{totalAnnualCharges.toLocaleString('fr-FR')} €</span
				>
			</div>
			<div class="flex justify-between items-center text-sm">
				<span class="text-slate-600">dont récupérables</span>
				<span class="font-semibold text-slate-900"
					>{totalRecoverableCharges.toLocaleString('fr-FR')} €</span
				>
			</div>
			<div class="flex justify-between items-center text-sm border-t border-slate-200 pt-2 mt-2">
				<span class="text-slate-600">Charges retenues pour le calcul</span>
				<span class="font-semibold text-slate-900"
					>{chargesUsedForCalculation.toLocaleString('fr-FR')} €</span
				>
			</div>
		</div>
	{/snippet}
</SectionCard>
