<script lang="ts">
	import type { Project } from '$lib/domain';
	import Input from '$lib/components/form/Input.svelte';
	import InfoBanner from '../InfoBanner.svelte';
	import StepCard from '../StepCard.svelte';

	let { project } = $props<{ project: Project }>();

	const isPurchase = $derived(project.projectType === 'purchase');
</script>

<section class="CostsStep mx-auto max-w-2xl space-y-8">
	<StepCard>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#if isPurchase}
				<Input
					id="ob-purchase-price"
					type="number"
					min={0}
					label="Prix d’achat"
					bind:value={project.cost.purchasePrice}
					suffix="€"
				/>
				<Input
					id="ob-notary"
					type="number"
					min={0}
					label="Frais de notaire"
					bind:value={project.cost.notaryFees}
					suffix="€"
				/>
				<Input
					id="ob-agency"
					type="number"
					min={0}
					label="Frais d’agence"
					bind:value={project.cost.agencyFees}
					suffix="€"
				/>
			{/if}
			<Input
				id="ob-reno"
				type="number"
				min={0}
				label="Travaux"
				bind:value={project.cost.renovationCost}
				suffix="€"
			/>
			<Input
				id="ob-furniture"
				type="number"
				min={0}
				label="Meubles"
				bind:value={project.cost.furnitureCost}
				suffix="€"
			/>
			<Input
				id="ob-bank"
				type="number"
				min={0}
				label="Frais bancaires (dossier, garantie…)"
				bind:value={project.cost.bankFees}
				suffix="€"
			/>
		</div>
	</StepCard>

	<InfoBanner>
		<p>
			Le <strong>coût total du projet</strong> sert au calcul de l’apport implicite et des indicateurs
			de rentabilité. Tu pourras ajuster le financement à l’étape suivante.
		</p>
	</InfoBanner>
</section>
