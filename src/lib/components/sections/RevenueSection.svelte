<script lang="ts">
	import Input from '$lib/components/form/Input.svelte';
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { RevenueSectionState, RentEntry, OtherIncomeEntry } from './sectionTypes';

	let { revenue = $bindable() } = $props<{
		revenue: RevenueSectionState;
	}>();

	function addRent() {
		revenue.rents = [...revenue.rents, { monthly_amount: 0 }];
	}
	function removeRent(i: number) {
		revenue.rents = revenue.rents.filter((_: RentEntry, idx: number) => idx !== i);
	}
	function addOtherIncome() {
		revenue.otherIncomes = [...revenue.otherIncomes, { label: '', amount: 0 }];
	}
	function removeOtherIncome(i: number) {
		revenue.otherIncomes = revenue.otherIncomes.filter(
			(_: OtherIncomeEntry, idx: number) => idx !== i
		);
	}

	const totalMonthlyRent = $derived(
		revenue.rents.reduce((s: number, r: RentEntry) => s + (r.monthly_amount || 0), 0)
	);
	const annualRentGrossBeforeVacancy = $derived(totalMonthlyRent * 12);
	const annualRentAfterVacancy = $derived(
		totalMonthlyRent * 12 * (1 - revenue.vacancyRate)
	);
	const totalOtherIncome = $derived(
		revenue.otherIncomes.reduce((s: number, r: OtherIncomeEntry) => s + (r.amount || 0), 0)
	);
	const totalAnnualRevenue = $derived(annualRentAfterVacancy + totalOtherIncome);
</script>

<SectionCard title="Revenus" variant="success">
	<p class="text-sm text-slate-600 mb-3">Loyers mensuels (plusieurs lignes possibles)</p>
	<div class="space-y-2 mb-4">
		{#each revenue.rents as rent, i (i)}
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-sm font-medium text-slate-700 min-w-[5rem]">Loyer {i + 1}</span>
				<Input
					type="number"
					min={0}
					bind:value={rent.monthly_amount}
					placeholder="€/mois"
					className="w-28 flex-1 min-w-0"
				/>
				<Button tone="danger" trailingIcon="trash" onClick={() => removeRent(i)} />
			</div>
		{/each}
		<button type="button" onclick={addRent} class="text-slate-600 text-sm underline"
			>+ Ajouter un loyer</button
		>
	</div>
	<div class="inline-block mb-2">
		<StatCard
			label="Total loyers mensuels"
			value={totalMonthlyRent.toLocaleString('fr-FR') + ' €'}
			size="sm"
			trend="neutral"
		/>
	</div>
	<div class="mb-4">
		<Input label="Vacance locative (%)" id="vacancy-rate" type="number" step={0.01} min={0} max={1} bind:value={revenue.vacancyRate} className="max-w-[120px]" />
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
		<StatCard
			label="Loyer annuel brut (€)"
			value={annualRentGrossBeforeVacancy.toLocaleString('fr-FR', {
				maximumFractionDigits: 0
			}) + ' €'}
			size="sm"
			trend="neutral"
		/>
		<StatCard
			label="Loyer annuel après vacance (€)"
			value={annualRentAfterVacancy.toLocaleString('fr-FR', {
				maximumFractionDigits: 0
			}) + ' €'}
			size="sm"
			trend="neutral"
		/>
	</div>
	{#if revenue.otherIncomes.length > 0}
		<p class="text-sm text-slate-600 mb-2">Autres revenus (€/an)</p>
		<div class="space-y-2 mb-3">
			{#each revenue.otherIncomes as other, i (i)}
				<div class="flex items-center gap-1">
					<Input
						id="other-income-label-{i}"
						bind:value={other.label}
						placeholder="Libellé (ex. Parking)"
						className="min-w-[180px]"
					/>
					<Input
						id="other-income-amount-{i}"
						type="number"
						min={0}
						bind:value={other.amount}
						placeholder="€/an"
						className="w-12"
					/>
					<Button tone="danger" trailingIcon="trash" onClick={() => removeOtherIncome(i)} />
				</div>
			{/each}
		</div>
	{/if}
	<button type="button" onclick={addOtherIncome} class="text-slate-600 text-sm underline"
		>+ Ajouter un autre revenu</button
	>
	{#snippet footer()}
		<div class="flex justify-between items-center w-full">
			<span class="font-medium text-slate-700">Total revenus annuels</span>
			<span class="text-lg font-semibold text-slate-900"
				>{totalAnnualRevenue.toLocaleString('fr-FR')} €</span
			>
		</div>
	{/snippet}
</SectionCard>
