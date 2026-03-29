<script lang="ts">
	import { FutureWork, type Project } from '$lib/domain';
	import Input from '$lib/components/form/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import InfoBanner from '../InfoBanner.svelte';
	import AddCard from '../AddCard.svelte';
	import StepCard from '../StepCard.svelte';

	let { project } = $props<{ project: Project }>();

	function addWork() {
		project.futureWorks = [...project.futureWorks, new FutureWork()];
	}

	function removeWork(i: number) {
		project.futureWorks = project.futureWorks.filter((_w: FutureWork, idx: number) => idx !== i);
	}
</script>

<section class="FutureWorksStep mx-auto max-w-2xl space-y-8">
	{#each project.futureWorks as w, i (i)}
		<StepCard>
			<div class="mb-4 flex items-center justify-between gap-2">
				<Label variant="default" label={`Poste n°${i + 1}`} />
				<Button
					variant="outline"
					tone="danger"
					size="sm"
					trailingIcon="trash"
					onClick={() => removeWork(i)}
				/>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Input
					id="ob-fw-type-{i}"
					label="Type de travaux"
					bind:value={w.work_type}
					className="md:col-span-2"
				/>
				<Input
					id="ob-fw-cost-{i}"
					type="number"
					min={0}
					label="Coût estimé"
					suffix="€"
					bind:value={w.estimated_cost}
				/>
				<Input
					id="ob-fw-year-{i}"
					type="number"
					min={0}
					label="Année prévue (depuis achat)"
					bind:value={w.planned_year}
				/>
				<Input
					id="ob-fw-freq-{i}"
					type="number"
					min={0}
					label="Fréquence"
					suffix="ans"
					className="md:col-span-2"
					bind:value={w.frequency_years}
				/>
			</div>
		</StepCard>
	{/each}

	<AddCard
		title="Ajouter un gros entretien"
		subtitle="Toiture, façade, équipements…"
		actionLabel="Ajouter"
		onadd={addWork}
	>
		{#snippet icon()}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path
					d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
				/>
			</svg>
		{/snippet}
	</AddCard>

	<InfoBanner>
		<p>
			Ces postes lissent un <strong>coût moyen annuel</strong> sur la durée du crédit pour le cash-flow
			et le TRI. Tu pourras les ajuster à tout moment dans le tableau de bord.
		</p>
	</InfoBanner>
</section>
