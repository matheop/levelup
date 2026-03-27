<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import { getPositiveChargeRows } from './chargesSummary';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const INFO_CHARGES =
		"Charges annuelles (€/an) : taxe foncière, copro, gestion, assurances, factures, comptabilité, provision entretien. Une partie peut être récupérable sur le locataire.";

	const rows = $derived(getPositiveChargeRows(project.charges));

</script>

<SectionCard
	title="Charges récurrentes"
	variant="danger"
	infoContent={INFO_CHARGES}
	onEdit={() => modal.push('charges', { project })}
>
	{#if rows.length === 0}
		<p class="text-sm text-fa-on-surface-variant">Aucune charge renseignée (&gt; 0). Utilise « Modifier » pour saisir.</p>
	{:else}
		<dl class="space-y-2 text-sm">
			{#each rows as r (r.key)}
				<div class="flex justify-between gap-4">
					<dt class="text-fa-on-surface-variant">{r.label}</dt>
					<dd class="font-semibold text-fa-primary-container">
						{r.value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/an
					</dd>
				</div>
			{/each}
		</dl>
	{/if}
</SectionCard>
