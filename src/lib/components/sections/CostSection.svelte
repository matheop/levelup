<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import AppModal from '$lib/components/ui/AppModal.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import Sumup from '$lib/components/layout/Sumup.svelte';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	let modalOpen = $state(false);

	const COUTS_INFO =
		"Prix d'achat, frais de notaire et d'agence, travaux, meubles, frais bancaires.";

	const totalProjectCost = $derived(project.cost.totalProjectCost(project.projectType));
</script>

<SectionCard title="Coûts" variant="muted" infoContent={COUTS_INFO} onEdit={() => (modalOpen = true)}>
	<dl class="space-y-2 text-sm">
		{#if project.projectType === 'purchase'}
			<div class="flex justify-between gap-4">
				<dt class="text-fa-on-surface-variant">Prix d'achat</dt>
				<dd class="font-semibold text-fa-primary-container">
					{project.cost.purchasePrice.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
				</dd>
			</div>
			<div class="flex justify-between gap-4">
				<dt class="text-fa-on-surface-variant">Frais de notaire</dt>
				<dd class="font-semibold text-fa-primary-container">
					{project.cost.notaryFees.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
				</dd>
			</div>
		{/if}
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Travaux (total)</dt>
			<dd class="font-semibold text-fa-primary-container">
				{project.cost.renovationCost.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
			</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Aménagement (meubles)</dt>
			<dd class="font-semibold text-fa-primary-container">
				{project.cost.furnitureCost.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
			</dd>
		</div>
	</dl>
</SectionCard>

<AppModal
	open={modalOpen}
	title="Coûts — édition"
	titleId="modal-cost-title"
	onClose={() => (modalOpen = false)}
>
	<div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:grid-cols-3">
		{#if project.projectType === 'purchase'}
			<Input label="Prix d'achat (€)" id="purchase-price-emb" type="number" min={0} bind:value={project.cost.purchasePrice} />
			<Input label="Frais de notaire (€)" id="notary-fees-emb" type="number" min={0} bind:value={project.cost.notaryFees} />
			<Input label="Frais d'agence (€)" id="agency-fees-emb" type="number" min={0} bind:value={project.cost.agencyFees} />
		{/if}
		<Input label="Travaux (€)" id="renovation-cost-emb" type="number" min={0} bind:value={project.cost.renovationCost} />
		<Input label="Meubles (€)" id="furniture-cost-emb" type="number" min={0} bind:value={project.cost.furnitureCost} />
		<Input label="Frais bancaires (€)" id="bank-fees-emb" type="number" min={0} bind:value={project.cost.bankFees} />
	</div>
	<div class="mt-4 border-t border-fa-outline-variant/20 pt-4">
		<Sumup title="Total coûts projet" cost={totalProjectCost} />
	</div>
</AppModal>
