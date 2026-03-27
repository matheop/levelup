<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const INFO_TRAVAUX =
		"Travaux futurs : type, coût estimé, année prévue, fréquence (années). Coût annualisé = coût / fréquence.";

	const count = $derived(project.futureWorks.length);
	const annualAvg = $derived(project.futureWorksAnnualAverage);

</script>

<SectionCard
	title="Travaux futurs"
	variant="danger"
	infoContent={INFO_TRAVAUX}
	onEdit={() => modal.push('futureWorks', { project })}
>
	<dl class="space-y-2 text-sm">
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Lignes saisies</dt>
			<dd class="font-semibold text-fa-primary-container">{count}</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Coût annualisé (estim.)</dt>
			<dd class="font-semibold text-fa-primary-container">
				{annualAvg.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/an
			</dd>
		</div>
	</dl>
</SectionCard>
