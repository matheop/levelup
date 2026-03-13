<script lang="ts">
	import FormField from '$lib/components/form/FormField.svelte';
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
		<FormField id="project-name" label="Nom">
			<Input id="project-name" bind:value={project.projectName} />
		</FormField>
		<FormField id="project-type" label="Type">
			<Select
				id="project-type"
				bind:value={project.projectType}
				options={[
					{ value: 'purchase', label: 'Achat + travaux' },
					{ value: 'renovation_only', label: 'Travaux seuls' }
				]}
			/>
		</FormField>
		<FormField id="tax-regime" label="Régime fiscal">
			<Select
				id="tax-regime"
				bind:value={project.taxRegime}
				options={[
					{ value: 'LMNP', label: 'LMNP' },
					{ value: 'NU', label: 'Location nue' },
					{ value: 'SCI_IS', label: "SCI à l'IS" }
				]}
			/>
		</FormField>
		{#if project.taxRegime === 'LMNP'}
			<FormField id="lmnp-sub-regime" label="Régime LMNP">
				<Select
					id="lmnp-sub-regime"
					bind:value={lmnpSubRegimeStr}
					options={[
						{ value: 'regime_reel_simplifie', label: 'Régime réel simplifié' },
						{ value: 'micro_bic', label: 'Micro-BIC (abattement 50 %)' }
					]}
				/>
			</FormField>
		{/if}
	</div>
</SectionCard>
