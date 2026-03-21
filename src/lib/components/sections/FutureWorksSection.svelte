<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import AppModal from '$lib/components/ui/AppModal.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { FutureWork, type Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	let modalOpen = $state(false);

	const INFO_TRAVAUX =
		"Travaux futurs : type, coût estimé, année prévue, fréquence (années). Coût annualisé = coût / fréquence.";

	const horizonYears = $derived(project.primaryFinancing.loanDuration);
	const count = $derived(project.futureWorks.length);
	const annualAvg = $derived(project.futureWorksAnnualAverage);

	const totalAnnualizedCost = $derived(
		project.futureWorks.length === 0
			? 0
			: project.futureWorks.reduce(
					(s: number, w: FutureWork) =>
						s + w.estimated_cost / (w.frequency_years || horizonYears),
					0
				)
	);

	function addFutureWork() {
		project.futureWorks = [
			...project.futureWorks,
			new FutureWork({ work_type: '', estimated_cost: 0, planned_year: 10, frequency_years: 0 })
		];
	}
	function removeFutureWork(i: number) {
		project.futureWorks = project.futureWorks.filter((_: FutureWork, idx: number) => idx !== i);
	}
</script>

<SectionCard
	title="Travaux futurs"
	variant="danger"
	infoContent={INFO_TRAVAUX}
	onEdit={() => (modalOpen = true)}
>
	<dl class="space-y-2 text-sm">
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Lignes saisies</dt>
			<dd class="font-semibold text-fa-primary-container">{count}</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Coût annualisé (estim.)</dt>
			<dd class="font-semibold text-fa-primary-container">
				{annualAvg.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/an
			</dd>
		</div>
	</dl>
</SectionCard>

<AppModal
	open={modalOpen}
	title="Travaux futurs — édition"
	titleId="modal-future-works-title"
	onClose={() => (modalOpen = false)}
>
	<div class="overflow-x-auto">
		<div class="space-y-2">
			<div class="grid grid-cols-5 items-center gap-1 text-sm font-medium text-fa-on-surface-variant">
				<span class="col-span-1">Type</span>
				<span class="col-span-1">Coût (€)</span>
				<span class="col-span-1">Année</span>
				<span class="col-span-1">Fréq. (ans)</span>
			</div>
			{#each project.futureWorks as work, i (i)}
				<div class="grid grid-cols-5 items-center gap-1">
					<Input bind:value={work.work_type} placeholder="Type" className="col-span-1" />
					<Input type="number" bind:value={work.estimated_cost} placeholder="0" className="col-span-1" />
					<Input type="number" bind:value={work.planned_year} placeholder="Année" className="col-span-1" />
					<Input type="number" bind:value={work.frequency_years} placeholder="Fréq." className="col-span-1" />
					<Button variant="transparent" tone="danger" trailingIcon="trash" onClick={() => removeFutureWork(i)} />
				</div>
			{/each}
		</div>
	</div>
	<Button variant="link" tone="default" label="+ Ajouter une ligne" onClick={addFutureWork} className="mt-2" />
	<div class="mt-4 flex w-full items-center justify-between border-t border-fa-outline-variant/20 pt-3">
		<span class="font-medium text-fa-on-surface-variant">Total coûts annualisés (sur {horizonYears} ans)</span>
		<span class="text-lg font-semibold text-fa-primary-container">
			{totalAnnualizedCost.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
		</span>
	</div>
</AppModal>
