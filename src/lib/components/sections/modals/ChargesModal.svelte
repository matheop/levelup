<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import type { Project } from '$lib/domain';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { project, onClose } = $props<{
		project: Project;
		onClose: () => void;
	}>();

	const totalAnnualCharges = $derived(project.charges.totalAnnualCharges);
	const totalRecoverableCharges = $derived(project.charges.totalRecoverableCharges);
	const chargesUsedForCalculation = $derived(project.charges.chargesUsedForCalculation);
</script>

<Modal open title="Charges récurrentes — édition" titleId="modal-charges-title" {onClose}>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
		<Input
			label="Taxe foncière (€/an)"
			id="property-tax-emb"
			type="number"
			min={0}
			bind:value={project.charges.propertyTax}
		/>
		<Input
			label="Charges de copropriété (€/an)"
			id="co-ownership-fees-emb"
			type="number"
			min={0}
			bind:value={project.charges.coOwnershipFees}
		/>
		<Input
			label="Gestion locative (€/an)"
			id="management-fees-emb"
			type="number"
			min={0}
			bind:value={project.charges.managementFees}
		/>
		<Input
			label="Assurances (€/an)"
			id="insurance-emb"
			type="number"
			min={0}
			bind:value={project.charges.insurance}
		/>
		<Input
			label="Factures (électricité, eau…) (€/an)"
			id="utilities-emb"
			type="number"
			min={0}
			bind:value={project.charges.utilities}
		/>
		<Input
			label="Honoraires comptables (€/an)"
			id="accounting-fees-emb"
			type="number"
			min={0}
			bind:value={project.charges.accountingFees}
		/>
		<Input
			label="Provision pour entretien (€/an)"
			id="maintenance-provision-emb"
			type="number"
			min={0}
			bind:value={project.charges.maintenanceProvision}
		/>
	</div>
	<div class="mt-3 space-y-1 border-t border-fa-outline-variant/20 pt-3">
		<div class="flex items-center justify-between">
			<span class="font-medium text-fa-on-surface-variant">Total charges annuelles</span>
			<span class="font-semibold text-fa-primary-container">{totalAnnualCharges.toLocaleString('fr-FR')} €</span>
		</div>
		<div class="flex items-center justify-between text-sm">
			<span class="text-fa-on-surface-variant">dont récupérables</span>
			<span class="font-semibold text-fa-primary-container"
				>{totalRecoverableCharges.toLocaleString('fr-FR')} €</span
			>
		</div>
		<div class="mt-2 flex items-center justify-between border-t border-fa-outline-variant/20 pt-2">
			<span class="text-fa-primary-container">Charges retenues pour le calcul</span>
			<span class="text-lg font-semibold text-fa-primary-container"
				>{chargesUsedForCalculation.toLocaleString('fr-FR')} €</span
			>
		</div>
	</div>
</Modal>
