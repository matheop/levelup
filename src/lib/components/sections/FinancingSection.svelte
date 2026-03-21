<script lang="ts">
	import SectionCard from '$lib/components/layout/SectionCard.svelte';
	import AppModal from '$lib/components/ui/AppModal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FinancingLoanSection from './FinancingLoanSection.svelte';
	import { Financing, type Project } from '$lib/domain';

	let { project } = $props<{
		project: Project;
	}>();

	let modalOpen = $state(false);

	const FINANCEMENT_INFO =
		"Montant emprunté, taux annuel, durée, différé, assurance emprunteur. Apport personnel = coût total du projet − emprunt. Mensualités et coût total du crédit calculés automatiquement.";

	const primary = $derived(project.primaryFinancing);
	const monthlyWithInsurance = $derived(
		primary.monthlyPayment() + (primary.loanInsuranceMonthly || 0)
	);
	const multiNote = $derived(project.financings.length > 1);

	function addFinancing() {
		const first = project.financings[0];
		project.financings = [
			...project.financings,
			new Financing(
				first
					? {
							loanAmount: first.loanAmount,
							interestRate: first.interestRate,
							loanDuration: first.loanDuration,
							loanDeferralMonths: first.loanDeferralMonths,
							loanInsuranceMonthly: first.loanInsuranceMonthly
						}
					: undefined
			)
		];
	}

	function removeFinancing(index: number) {
		if (project.financings.length <= 1) return;
		project.financings = project.financings.filter((_: Financing, i: number) => i !== index);
	}
</script>

<SectionCard
	title="Financement"
	infoContent={FINANCEMENT_INFO}
	className="border-l-4 border-l-fa-primary-container"
	onEdit={() => (modalOpen = true)}
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

<AppModal
	open={modalOpen}
	title="Financement — édition"
	titleId="modal-financing-title"
	onClose={() => (modalOpen = false)}
>
	<div class="mb-2 flex justify-end">
		<Button
			variant="transparent"
			tone="default"
			size="icon"
			ariaLabel="Ajouter un financement"
			className="rounded-full text-fa-primary-container hover:!bg-fa-primary-container/10"
			onClick={addFinancing}
		>
			{#snippet children()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M12 5v14" />
					<path d="M5 12h14" />
				</svg>
			{/snippet}
		</Button>
	</div>
	<div class="space-y-6">
		{#each project.financings as financing, i (financing.id)}
			<div
				class="space-y-4 rounded-lg bg-fa-surface-lowest p-4 ring-1 ring-fa-outline-variant/15"
				data-financing-index={i}
			>
				<div class="flex items-center justify-between gap-2">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-xs font-bold uppercase tracking-wider text-fa-primary-container">
							Prêt {i + 1}
						</span>
						{#if i === 0}
							<span class="rounded bg-fa-primary-container px-2 py-0.5 text-[10px] font-bold text-white">
								Principal
							</span>
						{/if}
					</div>
					{#if project.financings.length > 1}
						<Button
							variant="outline"
							label="Supprimer"
							tone="danger"
							size="sm"
							onClick={() => removeFinancing(i)}
						/>
					{/if}
				</div>
				<FinancingLoanSection
					{financing}
					totalProjectCost={project.totalProjectCost}
					totalProjectCostWithInterest={project.getTotalCostWithInterestForFinancing(financing)}
				/>
			</div>
		{/each}
	</div>
</AppModal>
