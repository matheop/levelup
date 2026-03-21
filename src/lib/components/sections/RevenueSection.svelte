<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import AppModal from '$lib/components/ui/AppModal.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Sumup from '$lib/components/layout/Sumup.svelte';
	import { RentEntry, OtherIncomeEntry, type Revenue } from '$lib/domain';

	let { revenue } = $props<{
		revenue: Revenue;
	}>();

	let modalOpen = $state(false);

	const annualRentAfterVacancySummary = $derived(revenue.annualRentAfterVacancy);
	const vacancyPct = $derived(
		(revenue.vacancyRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
	);

	function addRent() {
		revenue.rents = [...revenue.rents, new RentEntry(0)];
	}
	function removeRent(i: number) {
		revenue.rents = revenue.rents.filter((_: RentEntry, idx: number) => idx !== i);
	}
	function addOtherIncome() {
		revenue.otherIncomes = [...revenue.otherIncomes, new OtherIncomeEntry()];
	}
	function removeOtherIncome(i: number) {
		revenue.otherIncomes = revenue.otherIncomes.filter(
			(_: OtherIncomeEntry, idx: number) => idx !== i
		);
	}

	const totalMonthlyRent = $derived(revenue.totalMonthlyRent);
	const annualRentGrossBeforeVacancy = $derived(totalMonthlyRent * 12);
	const annualRentAfterVacancy = $derived(revenue.annualRentAfterVacancy);
	const totalAnnualRevenue = $derived(revenue.annualRevenueAfterVacancy);
</script>

<SectionCard title="Revenus locatifs" variant="success" onEdit={() => (modalOpen = true)}>
	<div class="rounded-xl border-l-4 border-fa-secondary bg-fa-secondary/5 p-4">
		<p class="mb-1 text-[10px] font-bold tracking-widest text-fa-secondary uppercase">
			Loyers annuels après vacance
		</p>
		<p class="text-2xl font-extrabold text-fa-secondary">
			{annualRentAfterVacancySummary.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
			<span class="ml-1 text-sm font-semibold text-fa-on-surface-variant">/ an</span>
		</p>
		<p class="mt-2 text-xs text-fa-on-surface-variant">Vacance locative : {vacancyPct} %</p>
	</div>
</SectionCard>

<AppModal
	open={modalOpen}
	title="Revenus — édition"
	titleId="modal-revenue-title"
	onClose={() => (modalOpen = false)}
>
	<p class="mb-3 text-sm text-fa-on-surface-variant">
		Loyers mensuels (plusieurs lignes possibles) — le total s’affiche ci-dessous.
	</p>
	<div class="mb-6 rounded-xl border-l-4 border-fa-secondary bg-fa-secondary/5 p-4">
		<p class="mb-1 text-[10px] font-bold tracking-widest text-fa-secondary uppercase">
			Total loyers mensuels (HC)
		</p>
		<p class="text-3xl font-extrabold text-fa-secondary">
			{totalMonthlyRent.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
			<span class="mb-1 ml-1 text-base font-bold">/ mois</span>
		</p>
	</div>
	<div class="mb-4 space-y-2">
		{#each revenue.rents as rent, i (i)}
			<div class="flex flex-wrap items-center gap-2">
				<span class="min-w-[5rem] text-sm font-medium text-fa-on-surface-variant">Loyer {i + 1}</span>
				<Input
					type="number"
					min={0}
					bind:value={rent.monthly_amount}
					placeholder="€/mois"
					className="min-w-0 w-28 flex-1"
				/>
				<Button variant="outline" tone="danger" trailingIcon="trash" onClick={() => removeRent(i)} />
			</div>
		{/each}
		<Button variant="link" tone="default" label="+ Ajouter un loyer" onClick={addRent} />
	</div>
	<div class="mb-4 inline-block">
		<StatCard
			label="Synthèse loyers"
			value={totalMonthlyRent.toLocaleString('fr-FR') + ' € / mois'}
			size="sm"
			trend="neutral"
		/>
	</div>
	<div class="mb-4">
		<Input
			label="Vacance locative (%)"
			id="vacancy-rate-modal"
			type="number"
			step={0.01}
			min={0}
			max={1}
			bind:value={revenue.vacancyRate}
			className="max-w-[120px]"
		/>
	</div>
	<div class="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
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
		<p class="mb-2 text-sm text-fa-on-surface-variant">Autres revenus (€/an)</p>
		<div class="mb-3 space-y-2">
			{#each revenue.otherIncomes as other, i (i)}
				<div class="flex items-center gap-1">
					<Input
						id="other-income-label-modal-{i}"
						bind:value={other.label}
						placeholder="Libellé (ex. Parking)"
						className="min-w-[180px]"
					/>
					<Input
						id="other-income-amount-modal-{i}"
						type="number"
						min={0}
						bind:value={other.amount}
						placeholder="€/an"
						className="w-12"
					/>
					<Button variant="outline" tone="danger" trailingIcon="trash" onClick={() => removeOtherIncome(i)} />
				</div>
			{/each}
		</div>
	{/if}
	<Button variant="link" tone="default" label="+ Ajouter un autre revenu" onClick={addOtherIncome} />
	<div class="mt-4 border-t border-fa-outline-variant/20 pt-4">
		<Sumup title="Total revenus annuels" cost={totalAnnualRevenue} />
	</div>
</AppModal>
