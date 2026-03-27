<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import FinancingLoanSection from '$lib/components/sections/FinancingLoanSection.svelte';
	import { Financing, type Project } from '$lib/domain';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { project, onClose } = $props<{
		project: Project;
		onClose: () => void;
	}>();

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

<Modal open title="Financement — édition" titleId="modal-financing-title" {onClose}>
	<div class="mb-2 flex justify-end">
		<Button
			variant="transparent"
			tone="default"
			size="icon"
			ariaLabel="Ajouter un financement"
			className="rounded-full text-fa-primary-container hover:!bg-fa-primary-container/10"
			onClick={addFinancing}
		>
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
						<span class="text-xs font-bold tracking-wider text-fa-primary-container uppercase">
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
</Modal>
