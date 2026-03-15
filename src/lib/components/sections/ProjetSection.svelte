<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import Select from '$lib/components/form/Select.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { LMNP_SUB_REGIMES, type LmnpSubRegime } from '$lib/constants';
	import type { Project } from '$lib/domain';

	let { project, embedded = false } = $props<{
		project: Project;
		embedded?: boolean;
	}>();

	let lmnpSubRegimeStr = $derived(
		(project.lmnpSubRegime ?? LMNP_SUB_REGIMES.reel_simplifie) as string
	);
	
	$effect(() => {
		project.lmnpSubRegime = (lmnpSubRegimeStr || LMNP_SUB_REGIMES.reel_simplifie) as LmnpSubRegime
	});
</script>

{#if embedded}
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<Input label="Nom" id="project-name-emb" bind:value={project.projectName} />
		<Select label="Type" id="project-type-emb" bind:value={project.projectType} options={[
			{ value: 'purchase', label: 'Achat + travaux' },
			{ value: 'renovation_only', label: 'Travaux seuls' }
		]} />
		<Select label="Régime fiscal" id="tax-regime-emb" bind:value={project.taxRegime} options={[
			{ value: 'LMNP', label: 'LMNP' },
			{ value: 'NU', label: 'Location nue' },
			{ value: 'SCI_IS', label: "SCI à l'IS" }
		]} />
		{#if project.taxRegime === 'LMNP'}
			<Select label="Régime LMNP" id="lmnp-sub-regime-emb" bind:value={lmnpSubRegimeStr} options={[
				{ value: LMNP_SUB_REGIMES.reel_simplifie, label: 'Régime réel simplifié' },
				{ value: LMNP_SUB_REGIMES.micro_bic, label: 'Micro-BIC (abattement 50 %)' }
			]} />
		{/if}
	</div>
{:else}
<SectionCard title="Projet">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
				{ value: LMNP_SUB_REGIMES.reel_simplifie, label: 'Régime réel simplifié' },
				{ value: LMNP_SUB_REGIMES.micro_bic, label: 'Micro-BIC (abattement 50 %)' }
			]} />
		{/if}
	</div>
</SectionCard>
{/if}
