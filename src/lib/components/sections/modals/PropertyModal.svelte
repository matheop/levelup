<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import Select from '$lib/components/form/Select.svelte';
	import { LMNP_SUB_REGIMES, type LmnpSubRegime } from '$lib/constants';
	import type { Project } from '$lib/domain';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { project, onClose } = $props<{
		project: Project;
		onClose: () => void;
	}>();

	let lmnpSubRegimeStr = $derived(
		(project.lmnpSubRegime ?? LMNP_SUB_REGIMES.reel_simplifie) as string
	);

	$effect(() => {
		project.lmnpSubRegime = (lmnpSubRegimeStr || LMNP_SUB_REGIMES.reel_simplifie) as LmnpSubRegime;
	});
</script>

<Modal open title="Le bien — édition" titleId="modal-property-title" {onClose}>
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
</Modal>
