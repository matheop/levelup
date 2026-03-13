<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { FutureWorkEntry } from './sectionTypes';

	let { futureWorks = $bindable(), horizonYears = 20 } = $props<{
		futureWorks: FutureWorkEntry[];
		horizonYears?: number;
	}>();

	const totalAnnualizedCost = $derived(
		futureWorks.length === 0
			? 0
			: futureWorks.reduce(
					(s: number, w: FutureWorkEntry) =>
						s + w.estimated_cost / (w.frequency_years || horizonYears),
					0
				)
	);

	function addFutureWork() {
		futureWorks = [
			...futureWorks,
			{ work_type: '', estimated_cost: 0, planned_year: 10, frequency_years: 0 }
		];
	}
	function removeFutureWork(i: number) {
		futureWorks = futureWorks.filter((_: FutureWorkEntry, idx: number) => idx !== i);
	}
</script>

<SectionCard title="Travaux futurs" variant="danger">
	<div class="overflow-x-auto">
		<div class="space-y-2">
			<div class="grid grid-cols-5 items-center gap-1 text-sm text-slate-500 font-medium">
				<span class="col-span-1">Type</span>
				<span class="col-span-1">Coût (€)</span>
				<span class="col-span-1">Année</span>
				<span class="col-span-1">Fréq. (ans)</span>
			</div>
			{#each futureWorks as work, i (i)}
				<div class="grid grid-cols-5 items-center gap-1">
					<Input bind:value={work.work_type} placeholder="Type" className="col-span-1" />
					<Input type="number" bind:value={work.estimated_cost} placeholder="0" className="col-span-1" />
					<Input type="number" bind:value={work.planned_year} placeholder="Année" className="col-span-1" />
					<Input type="number" bind:value={work.frequency_years} placeholder="Fréq." className="col-span-1" />
					<Button tone="danger" trailingIcon="trash" onClick={() => removeFutureWork(i)} className="" />
				</div>
			{/each}
		</div>
	</div>
	<button type="button" onclick={addFutureWork} class="text-slate-600 text-sm underline mt-2"
		>+ Ajouter une ligne</button
	>
	{#snippet footer()}
		<div class="flex justify-between items-center w-full">
			<span class="font-medium text-slate-700">Total coûts annualisés (sur {horizonYears} ans)</span>
			<span class="text-lg font-semibold text-slate-900">
				{totalAnnualizedCost.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
			</span>
		</div>
	{/snippet}
</SectionCard>
