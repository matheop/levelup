<script lang="ts">
	import type { Project } from '$lib/domain';
	import type { TaxBracketRate } from '$lib/domain/Taxes.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import Select from '$lib/components/form/Select.svelte';
	import InfoBanner from '../InfoBanner.svelte';
	import StepCard from '../StepCard.svelte';
	import { LMNP_SUB_REGIMES } from '$lib/constants';

	let { project } = $props<{ project: Project }>();

	const projectTypeOptions = [
		{ value: 'purchase', label: 'Achat (avec ou sans travaux)' },
		{ value: 'renovation_only', label: 'Travaux seuls' }
	];

	const taxRegimeOptions = [
		{ value: 'LMNP', label: 'LMNP' },
		{ value: 'NU', label: 'Location nue' },
		{ value: 'SCI_IS', label: 'SCI à l’IS' }
	];

	const lmnpOptions = [
		{ value: LMNP_SUB_REGIMES.reel_simplifie, label: 'Régime réel simplifié' },
		{ value: LMNP_SUB_REGIMES.micro_bic, label: 'Micro-BIC' }
	];

	const taxBracketOptions: { value: string; label: string }[] = [
		{ value: '0', label: '0 %' },
		{ value: '0.11', label: '11 %' },
		{ value: '0.3', label: '30 %' },
		{ value: '0.41', label: '41 %' },
		{ value: '0.45', label: '45 %' }
	];

	// Sync initiale depuis le projet ; la liste des tranches reste la source de vérité côté Select.
	/* svelte-ignore state_referenced_locally */
	let taxBracketStr = $state(String(project.taxes.taxBracketRate));

	$effect(() => {
		const n = Number.parseFloat(taxBracketStr);
		if (Number.isFinite(n) && [0, 0.11, 0.3, 0.41, 0.45].includes(n)) {
			project.taxes.taxBracketRate = n as TaxBracketRate;
		}
	});
</script>

<section class="ProjectStep mx-auto max-w-2xl space-y-8">
	<StepCard>
		<div class="space-y-6">
			<Input id="ob-project-name" label="Nom du projet" bind:value={project.projectName} />

			<Select
				id="ob-project-type"
				label="Type de projet"
				bind:value={project.projectType}
				options={projectTypeOptions}
			/>

			<Select
				id="ob-tax-regime"
				label="Régime fiscal"
				bind:value={project.taxRegime}
				options={taxRegimeOptions}
			/>

			{#if project.taxRegime === 'LMNP'}
				<Select
					id="ob-lmnp-sub"
					label="Sous-régime LMNP"
					bind:value={project.lmnpSubRegime}
					options={lmnpOptions}
				/>
			{/if}

			{#if project.taxRegime === 'LMNP'}
				<Select
					id="ob-tax-bracket"
					label="Tranche marginale d’imposition (IR)"
					bind:value={taxBracketStr}
					options={taxBracketOptions}
				/>
			{/if}
		</div>
	</StepCard>

	<InfoBanner variant="info">
		<p>
			Le régime fiscal pilote les règles d’amortissement, les charges déductibles et l’imposition
			dans la simulation. Tu pourras affiner les taux et montants aux étapes suivantes.
		</p>
	</InfoBanner>
</section>
