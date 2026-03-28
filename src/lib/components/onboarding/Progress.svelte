<script lang="ts">
	let { currentStep, totalSteps, sectionTitle } = $props<{
		currentStep: number;
		totalSteps: number;
		sectionTitle: string;
	}>();
</script>

<div class="Progress mb-10 flex flex-col items-center">
	<div class="mb-4 flex gap-3">
		{#each Array.from({ length: totalSteps }, (_, i) => i + 1) as n (n)}
			<div
				class="h-1.5 w-12 rounded-full transition-colors {n <= currentStep
					? 'bg-fa-primary-container'
					: 'bg-fa-surface-high'}"
				aria-hidden="true"
			></div>
		{/each}
	</div>
	<span class="text-xs font-medium tracking-widest text-fa-outline uppercase">
		Étape {currentStep} sur {totalSteps}
	</span>
	<h1 class="mt-2 text-center text-3xl font-extrabold tracking-tight text-fa-primary-container">
		{sectionTitle}
	</h1>
</div>
