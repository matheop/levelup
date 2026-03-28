<script lang="ts">
	import { Financing, type Project } from '$lib/domain';
	import Input from '$lib/components/form/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import InfoBanner from '../InfoBanner.svelte';
	import AddCard from '../AddCard.svelte';
	import StepCard from '../StepCard.svelte';

	let { project } = $props<{ project: Project }>();

	function addFinancing() {
		project.financings = [
			...project.financings,
			new Financing({
				loanAmount: 0,
				interestRate: 0,
				loanDuration: 20,
				loanDeferralMonths: 0,
				loanInsuranceMonthly: 0
			})
		];
	}

	function removeFinancing(index: number) {
		if (index === 0) return;
		project.financings = project.financings.filter((_f: Financing, i: number) => i !== index);
	}
</script>

<section class="FinancingStep mx-auto max-w-2xl space-y-8">
	<div class="flex items-center justify-between gap-4">
		<h2 class="text-xl font-bold text-fa-primary-container">Plan de financement</h2>
		<Button
			variant="link"
			tone="success"
			size="md"
			label="+ Ajouter un prêt"
			onClick={addFinancing}
		/>
	</div>

	{#each project.financings as f, i (f.id)}
		<StepCard>
			{#if i === 0}
				<div class="absolute top-5 right-5 md:top-6 md:right-6">
					<Label variant="info" label="Prêt principal" />
				</div>
			{:else}
				<div class="absolute top-5 right-5 md:top-6 md:right-6">
					<Button
						variant="outline"
						tone="danger"
						size="sm"
						trailingIcon="trash"
						ariaLabel="Supprimer ce prêt"
						onClick={() => removeFinancing(i)}
					/>
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
				<Input
					id="ob-loan-amt-{f.id}"
					type="number"
					min={0}
					label="Montant emprunté"
					suffix="€"
					bind:value={f.loanAmount}
				/>
				<Input
					id="ob-loan-dur-{f.id}"
					type="number"
					min={1}
					label="Durée"
					suffix="ans"
					bind:value={f.loanDuration}
				/>
				<Input
					id="ob-rate-{f.id}"
					type="number"
					step={0.01}
					min={0}
					label="Taux nominal"
					suffix="%"
					displayValue={f.interestRate * 100}
					onValueInput={(e) => {
						const v = Number(e.currentTarget.value);
						f.interestRate = Number.isFinite(v) ? v / 100 : 0;
					}}
				/>
				<Input
					id="ob-defer-{f.id}"
					type="number"
					min={0}
					label="Différé"
					suffix="mois"
					bind:value={f.loanDeferralMonths}
				/>
				<div class="md:col-span-2">
					<Input
						id="ob-ins-{f.id}"
						type="number"
						min={0}
						step={0.01}
						label="Assurance emprunteur"
						suffix="€/mois"
						bind:value={f.loanInsuranceMonthly}
					/>
				</div>
			</div>
		</StepCard>
	{/each}

	<AddCard
		title="Autre prêt (travaux, PTZ…)"
		subtitle="Comparer plusieurs financements côté tableau de bord."
		actionLabel="Ajouter"
		onadd={addFinancing}
	>
		{#snippet icon()}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
			</svg>
		{/snippet}
	</AddCard>

	<InfoBanner variant="info">
		<p>
			Le calcul est basé sur un <strong>remboursement mensuel constant</strong>. Les prêts au-delà
			du
			<strong>prêt principal</strong> servent pour l’instant au <strong>comparatif</strong> dans le simulateur
			(la simulation principale utilise le premier prêt).
		</p>
	</InfoBanner>
</section>
