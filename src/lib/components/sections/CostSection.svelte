<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import type { CostSectionState, ProjectType } from './sectionTypes';

	let { costs = $bindable(), projectType } = $props<{
		costs: CostSectionState;
		projectType: ProjectType;
	}>();

	const totalProjectCost = $derived(
		(projectType === 'purchase'
			? costs.purchasePrice + costs.notaryFees + (costs.agencyFees ?? 0)
			: 0) +
			costs.renovationCost +
			(costs.furnitureCost || 0) +
			costs.bankFees +
			costs.guaranteeFees
	);
</script>

<SectionCard title="Coûts totaux du projet">
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 text-sm">
		{#if projectType === 'purchase'}
			<Input label="Prix d'achat (€)" id="purchase-price" type="number" min={0} bind:value={costs.purchasePrice} />
			<Input label="Frais de notaire (€)" id="notary-fees" type="number" min={0} bind:value={costs.notaryFees} />
			<Input label="Frais d'agence (€)" id="agency-fees" type="number" min={0} bind:value={costs.agencyFees} />
		{/if}
		<Input label="Travaux (€)" id="renovation-cost" type="number" min={0} bind:value={costs.renovationCost} />
		<Input label="Meubles (€)" id="furniture-cost" type="number" min={0} bind:value={costs.furnitureCost} />
		<Input label="Frais bancaires (€)" id="bank-fees" type="number" min={0} bind:value={costs.bankFees} />
		<Input label="Frais de caution (€)" id="guarantee-fees" type="number" min={0} bind:value={costs.guaranteeFees} />
	</div>
	{#snippet footer()}
		<div class="flex justify-between items-center w-full">
			<span class="font-medium text-slate-700">Total coûts projet</span>
			<span class="text-lg font-semibold text-slate-900">{totalProjectCost.toLocaleString('fr-FR')} €</span>
		</div>
	{/snippet}
</SectionCard>
