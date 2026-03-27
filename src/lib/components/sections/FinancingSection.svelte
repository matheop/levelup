<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import type { Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	const FINANCEMENT_INFO =
		"Montant emprunté, taux annuel, durée, différé, assurance emprunteur. Apport personnel = coût total du projet − emprunt. Mensualités et coût total du crédit calculés automatiquement.";

	const primary = $derived(project.primaryFinancing);
	const monthlyWithInsurance = $derived(
		primary.monthlyPayment() + (primary.loanInsuranceMonthly || 0)
	);
	const multiNote = $derived(project.financings.length > 1);

</script>

<SectionCard
	title="Financement"
	infoContent={FINANCEMENT_INFO}
	className="border-l-4 border-l-fa-primary-container"
	onEdit={() => modal.push('financing', { project })}
>
	<dl class="space-y-2 text-sm">
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Montant emprunté (principal)</dt>
			<dd class="font-semibold text-fa-primary-container">
				{primary.loanAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
			</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Mensualité (avec assurance)</dt>
			<dd class="font-semibold text-fa-primary-container">
				{monthlyWithInsurance.toLocaleString('fr-FR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})} €
			</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt class="text-fa-on-surface-variant">Durée</dt>
			<dd class="font-semibold text-fa-primary-container">{primary.loanDuration} ans</dd>
		</div>
		{#if multiNote}
			<p class="text-xs text-fa-on-surface-variant">
				{project.financings.length} prêts — détail dans « Modifier ».
			</p>
		{/if}
	</dl>
</SectionCard>
