<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import Sumup from '$lib/components/layout/Sumup.svelte';
	import type { Project } from '$lib/domain';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { project, onClose } = $props<{
		project: Project;
		onClose: () => void;
	}>();

	const totalProjectCost = $derived(project.cost.totalProjectCost(project.projectType));
</script>

<Modal open title="Coûts — édition" titleId="modal-cost-title" {onClose}>
	<div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:grid-cols-3">
		{#if project.projectType === 'purchase'}
			<Input
				label="Prix d'achat (€)"
				id="purchase-price-emb"
				type="number"
				min={0}
				bind:value={project.cost.purchasePrice}
			/>
			<Input
				label="Frais de notaire (€)"
				id="notary-fees-emb"
				type="number"
				min={0}
				bind:value={project.cost.notaryFees}
			/>
			<Input
				label="Frais d'agence (€)"
				id="agency-fees-emb"
				type="number"
				min={0}
				bind:value={project.cost.agencyFees}
			/>
		{/if}
		<Input
			label="Travaux (€)"
			id="renovation-cost-emb"
			type="number"
			min={0}
			bind:value={project.cost.renovationCost}
		/>
		<Input
			label="Meubles (€)"
			id="furniture-cost-emb"
			type="number"
			min={0}
			bind:value={project.cost.furnitureCost}
		/>
		<Input
			label="Frais bancaires (€)"
			id="bank-fees-emb"
			type="number"
			min={0}
			bind:value={project.cost.bankFees}
		/>
	</div>
	<div class="mt-4 border-t border-fa-outline-variant/20 pt-4">
		<Sumup title="Total coûts projet" cost={totalProjectCost} />
	</div>
</Modal>
