<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import AppModal from '$lib/components/ui/AppModal.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import Select from '$lib/components/form/Select.svelte';
	import type { Project } from '$lib/domain';
	import { LMNP_SUB_REGIMES, type LmnpSubRegime } from '$lib/constants';

	let { project } = $props<{
		project: Project;
	}>();

	let modalOpen = $state(false);

	let lmnpSubRegimeStr = $derived(
		(project.lmnpSubRegime ?? LMNP_SUB_REGIMES.reel_simplifie) as string
	);

	$effect(() => {
		project.lmnpSubRegime = (lmnpSubRegimeStr || LMNP_SUB_REGIMES.reel_simplifie) as LmnpSubRegime;
	});

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

<SectionCard title="Le bien" infoContent={LE_BIEN_INFO} onEdit={() => (modalOpen = true)}>
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

<AppModal
	open={modalOpen}
	title="Le bien — édition"
	titleId="modal-property-title"
	onClose={() => (modalOpen = false)}
>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<Input label="Nom" id="project-name-emb" bind:value={project.projectName} />
		<Select
			label="Type"
			id="project-type-emb"
			bind:value={project.projectType}
			options={[
				{ value: 'purchase', label: 'Achat + travaux' },
				{ value: 'renovation_only', label: 'Travaux seuls' }
			]}
		/>
		<Select
			label="Régime fiscal"
			id="tax-regime-emb"
			bind:value={project.taxRegime}
			options={[
				{ value: 'LMNP', label: 'LMNP' },
				{ value: 'NU', label: 'Location nue' },
				{ value: 'SCI_IS', label: "SCI à l'IS" }
			]}
		/>
		{#if project.taxRegime === 'LMNP'}
			<Select
				label="Régime LMNP"
				id="lmnp-sub-regime-emb"
				bind:value={lmnpSubRegimeStr}
				options={[
					{ value: LMNP_SUB_REGIMES.reel_simplifie, label: 'Régime réel simplifié' },
					{ value: LMNP_SUB_REGIMES.micro_bic, label: 'Micro-BIC (abattement 50 %)' }
				]}
			/>
		{/if}
	</div>
</AppModal>
