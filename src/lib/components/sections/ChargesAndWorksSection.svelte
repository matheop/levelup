<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import SectionSubtitle from '$lib/components/layout/SectionSubtitle.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import ChargesSection from './ChargesSection.svelte';
	import FutureWorksSection from './FutureWorksSection.svelte';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const INFO_CHARGES =
		"Charges annuelles (€/an) : taxe foncière, copro, gestion, assurances, factures, comptabilité, provision entretien. Une partie peut être récupérable sur le locataire.";
	const INFO_TRAVAUX_FUTURS =
		"Travaux futurs : type, coût estimé, année prévue, fréquence (années). Coût annualisé = coût / fréquence.";
</script>

<SectionCard title="Charges & travaux futurs" variant="danger">
	<SectionSubtitle title="1. Charges récurrentes" infoContent={INFO_CHARGES} />
	<ChargesSection charges={project.charges} embedded />
	<SectionSubtitle
		title="2. Travaux futurs"
		infoContent={INFO_TRAVAUX_FUTURS}
		className="pt-4 border-t border-slate-200"
	/>
	<FutureWorksSection project={project} horizonYears={project.primaryFinancing.loanDuration} embedded />
	{#snippet footer()}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<StatCard
				label="Total charges + travaux (€/an)"
				value={project.totalChargesAndWorksAnnual.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €'}
				size="sm"
				trend="neutral"
			/>
			<StatCard
				label="Total charges + travaux (€/mois)"
				value={project.totalChargesAndWorksMonthly.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' €'}
				size="sm"
				trend="neutral"
			/>
		</div>
	{/snippet}
</SectionCard>
