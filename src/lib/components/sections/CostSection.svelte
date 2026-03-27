<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const COUTS_INFO =
		"Prix d'achat, frais de notaire et d'agence, travaux, meubles, frais bancaires.";

</script>

<SectionCard title="Coûts" infoContent={COUTS_INFO} onEdit={() => modal.push('cost', { project })}>
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
