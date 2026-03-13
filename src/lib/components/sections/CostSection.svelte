<script lang="ts">
	import FormField from '$lib/components/form/FormField.svelte';
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
			<FormField id="purchase-price" label="Prix d'achat (€)" className="text-slate-500 mb-0.5">
				<Input id="purchase-price" type="number" min={0} bind:value={costs.purchasePrice} />
			</FormField>
			<FormField id="notary-fees" label="Frais de notaire (€)" className="text-slate-500 mb-0.5">
				<Input id="notary-fees" type="number" min={0} bind:value={costs.notaryFees} />
			</FormField>
			<FormField id="agency-fees" label="Frais d'agence (€)" className="text-slate-500 mb-0.5">
				<Input id="agency-fees" type="number" min={0} bind:value={costs.agencyFees} />
			</FormField>
		{/if}
		<FormField id="renovation-cost" label="Travaux (€)" className="text-slate-500 mb-0.5">
			<Input id="renovation-cost" type="number" min={0} bind:value={costs.renovationCost} />
		</FormField>
		<FormField id="furniture-cost" label="Meubles (€)" className="text-slate-500 mb-0.5">
			<Input id="furniture-cost" type="number" min={0} bind:value={costs.furnitureCost} />
		</FormField>
		<FormField id="bank-fees" label="Frais bancaires (€)" className="text-slate-500 mb-0.5">
			<Input id="bank-fees" type="number" min={0} bind:value={costs.bankFees} />
		</FormField>
		<FormField id="guarantee-fees" label="Frais de caution (€)" className="text-slate-500 mb-0.5">
			<Input id="guarantee-fees" type="number" min={0} bind:value={costs.guaranteeFees} />
		</FormField>
	</div>
	{#snippet footer()}
		<div class="flex justify-between items-center w-full">
			<span class="font-medium text-slate-700">Total coûts projet</span>
			<span class="text-lg font-semibold text-slate-900">{totalProjectCost.toLocaleString('fr-FR')} €</span>
		</div>
	{/snippet}
</SectionCard>
