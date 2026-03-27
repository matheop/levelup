<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import { LMNP_SUB_REGIMES } from '$lib/constants';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const LE_BIEN_INFO =
		'Nom du projet, type (achat + travaux ou travaux seuls), régime fiscal (modifiable ici ou dans le bandeau du haut).';

	const projectTypeLabel = $derived(
		project.projectType === 'purchase' ? 'Achat + travaux' : 'Travaux seuls'
	);
	const taxLabel = $derived(
		project.taxRegime === 'LMNP'
			? 'LMNP'
			: project.taxRegime === 'NU'
				? 'Location nue'
				: "SCI à l'IS"
	);
	const lmnpSubLabel = $derived(
		project.taxRegime === 'LMNP'
			? project.lmnpSubRegime === LMNP_SUB_REGIMES.micro_bic
				? 'Micro-BIC'
				: 'Réel simplifié'
			: null
	);
</script>

<SectionCard
	title="Le bien"
	infoContent={LE_BIEN_INFO}
	onEdit={() => modal.push('property', { project })}
>
	<dl class="space-y-2 text-sm">
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Nom</dt>
			<dd class="font-semibold text-fa-primary-container">{project.projectName || '—'}</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Type</dt>
			<dd class="font-semibold text-fa-primary-container">{projectTypeLabel}</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Régime fiscal</dt>
			<dd class="font-semibold text-fa-primary-container">{taxLabel}</dd>
		</div>
		{#if lmnpSubLabel}
			<div class="flex justify-between gap-4">
				<dt class="text-fa-on-surface-variant">Sous-régime LMNP</dt>
				<dd class="font-semibold text-fa-primary-container">{lmnpSubLabel}</dd>
			</div>
		{/if}
	</dl>
</SectionCard>
