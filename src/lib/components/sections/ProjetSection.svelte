<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import Select from '$lib/components/form/Select.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import type { ProjectSectionState } from './sectionTypes';

	let { project = $bindable() } = $props<{
		project: ProjectSectionState;
	}>();

	let lmnpSubRegimeStr = $state((project.lmnpSubRegime ?? 'regime_reel_simplifie') as string);
	$effect(() => {
		project.lmnpSubRegime = (lmnpSubRegimeStr || 'regime_reel_simplifie') as
			| 'micro_bic'
			| 'regime_reel_simplifie';
	});
</script>

<SectionCard title="Projet">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<Input label="Nom" id="project-name" bind:value={project.projectName} />
		<Select label="Type" id="project-type" bind:value={project.projectType} options={[
			{ value: 'purchase', label: 'Achat + travaux' },
			{ value: 'renovation_only', label: 'Travaux seuls' }
		]} />
		<Select label="Régime fiscal" id="tax-regime" bind:value={project.taxRegime} options={[
			{ value: 'LMNP', label: 'LMNP' },
			{ value: 'NU', label: 'Location nue' },
			{ value: 'SCI_IS', label: "SCI à l'IS" }
		]} />
		{#if project.taxRegime === 'LMNP'}
			<Select label="Régime LMNP" id="lmnp-sub-regime" bind:value={lmnpSubRegimeStr} options={[
				{ value: 'regime_reel_simplifie', label: 'Régime réel simplifié' },
				{ value: 'micro_bic', label: 'Micro-BIC (abattement 50 %)' }
			]} />
		{/if}
	</div>
</SectionCard>
