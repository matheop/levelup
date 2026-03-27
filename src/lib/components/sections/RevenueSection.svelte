<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import type { Revenue } from '$lib/domain';

	let { revenue } = $props<{
		revenue: Revenue;
	}>();

	const annualRentAfterVacancySummary = $derived(revenue.annualRentAfterVacancy);
	const vacancyPct = $derived(
		(revenue.vacancyRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
	);

</script>

<SectionCard
	title="Revenus locatifs"
	variant="success"
	onEdit={() => modal.push('revenue', { revenue })}
>
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
