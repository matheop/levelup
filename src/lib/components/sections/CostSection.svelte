<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import Sumup from '../layout/Sumup.svelte';
	import type { Cost } from '$lib/domain';
	import type { ProjectType } from '$lib/dbTypes';

	let { cost, projectType, embedded = false } = $props<{
		cost: Cost;
		projectType: ProjectType;
		embedded?: boolean;
	}>();

	const totalProjectCost = $derived(cost.totalProjectCost(projectType));
</script>

{#if embedded}
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 text-sm">
		{#if projectType === 'purchase'}
			<Input label="Prix d'achat (€)" id="purchase-price-emb" type="number" min={0} bind:value={cost.purchasePrice} />
			<Input label="Frais de notaire (€)" id="notary-fees-emb" type="number" min={0} bind:value={cost.notaryFees} />
			<Input label="Frais d'agence (€)" id="agency-fees-emb" type="number" min={0} bind:value={cost.agencyFees} />
		{/if}
		<Input label="Travaux (€)" id="renovation-cost-emb" type="number" min={0} bind:value={cost.renovationCost} />
		<Input label="Meubles (€)" id="furniture-cost-emb" type="number" min={0} bind:value={cost.furnitureCost} />
		<Input label="Frais bancaires (€)" id="bank-fees-emb" type="number" min={0} bind:value={cost.bankFees} />
	</div>
{:else}
<SectionCard title="Coûts totaux du projet">
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 text-sm">
		{#if projectType === 'purchase'}
			<Input label="Prix d'achat (€)" id="purchase-price" type="number" min={0} bind:value={cost.purchasePrice} />
			<Input label="Frais de notaire (€)" id="notary-fees" type="number" min={0} bind:value={cost.notaryFees} />
			<Input label="Frais d'agence (€)" id="agency-fees" type="number" min={0} bind:value={cost.agencyFees} />
		{/if}
		<Input label="Travaux (€)" id="renovation-cost" type="number" min={0} bind:value={cost.renovationCost} />
		<Input label="Meubles (€)" id="furniture-cost" type="number" min={0} bind:value={cost.furnitureCost} />
		<Input label="Frais bancaires (€)" id="bank-fees" type="number" min={0} bind:value={cost.bankFees} />
	</div>
	{#snippet footer()}
		<Sumup title="Total coûts projet" cost={totalProjectCost} />
	{/snippet}
</SectionCard>
{/if}
