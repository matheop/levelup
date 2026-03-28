<script lang="ts">
	import { OtherIncomeEntry, RentEntry, type Project } from '$lib/domain';
	import Input from '$lib/components/form/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import InfoBanner from '../InfoBanner.svelte';
	import AddCard from '../AddCard.svelte';
	import StepCard from '../StepCard.svelte';

	let { project } = $props<{ project: Project }>();

	function addRent() {
		project.revenue.rents = [...project.revenue.rents, new RentEntry(0)];
	}
	function removeRent(i: number) {
		if (project.revenue.rents.length <= 1) return;
		project.revenue.rents = project.revenue.rents.filter((_r: RentEntry, idx: number) => idx !== i);
	}
	function addOtherIncome() {
		project.revenue.otherIncomes = [...project.revenue.otherIncomes, new OtherIncomeEntry()];
	}
	function removeOtherIncome(i: number) {
		project.revenue.otherIncomes = project.revenue.otherIncomes.filter(
			(_o: OtherIncomeEntry, idx: number) => idx !== i
		);
	}
</script>

<section class="RevenueChargesStep mx-auto max-w-2xl space-y-8">
	<StepCard>
		<div class="space-y-6">
			<h2 class="text-xl font-bold text-fa-primary-container">Revenus</h2>
			{#each project.revenue.rents as rent, i (i)}
				<div class="flex flex-wrap items-end gap-2">
					<Input
						id="ob-rent-{i}"
						type="number"
						min={0}
						label="Loyer mensuel {i + 1}"
						suffix="€"
						bind:value={rent.monthly_amount}
						className="min-w-[12rem] flex-1"
					/>
					{#if project.revenue.rents.length > 1}
						<Button
							variant="outline"
							tone="danger"
							trailingIcon="trash"
							onClick={() => removeRent(i)}
						/>
					{/if}
				</div>
			{/each}

			<AddCard
				title="Ajouter une ligne de loyer"
				subtitle="Plusieurs lots ou baux."
				actionLabel="Ajouter"
				onadd={addRent}
			>
				{#snippet icon()}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path d="M12 5v14M5 12h14" />
					</svg>
				{/snippet}
			</AddCard>

			<Input
				id="ob-vacancy"
				type="number"
				step={0.1}
				min={0}
				max={100}
				label="Vacance locative"
				suffix="%"
				className="max-w-xs"
				displayValue={project.revenue.vacancyRate * 100}
				onValueInput={(e) => {
					const v = Number(e.currentTarget.value);
					project.revenue.vacancyRate = Number.isFinite(v)
						? Math.min(100, Math.max(0, v / 100))
						: 0;
				}}
			/>

			{#if project.revenue.otherIncomes.length > 0}
				<div class="space-y-3">
					<h3 class="text-sm font-bold text-fa-on-surface-variant">Autres revenus (€/an)</h3>
					{#each project.revenue.otherIncomes as other, i (i)}
						<div class="flex flex-wrap items-end gap-2">
							<Input
								id="ob-oi-l-{i}"
								bind:value={other.label}
								placeholder="Libellé"
								className="min-w-[10rem] flex-1"
							/>
							<Input
								id="ob-oi-a-{i}"
								type="number"
								min={0}
								suffix="€"
								bind:value={other.amount}
								className="w-40"
							/>
							<Button
								variant="outline"
								tone="danger"
								trailingIcon="trash"
								onClick={() => removeOtherIncome(i)}
							/>
						</div>
					{/each}
				</div>
			{/if}

			<AddCard
				title="Autre revenu annuel"
				subtitle="Parking, cave, etc."
				actionLabel="Ajouter"
				onadd={addOtherIncome}
			>
				{#snippet icon()}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path d="M12 5v14M5 12h14" />
					</svg>
				{/snippet}
			</AddCard>
		</div>
	</StepCard>

	<StepCard>
		<div class="space-y-6">
			<h2 class="text-xl font-bold text-fa-primary-container">Charges annuelles</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Input
					id="ob-ctax"
					type="number"
					min={0}
					label="Taxe foncière"
					suffix="€"
					bind:value={project.charges.propertyTax}
				/>
				<Input
					id="ob-copro"
					type="number"
					min={0}
					label="Charges de copropriété"
					suffix="€"
					bind:value={project.charges.coOwnershipFees}
				/>
				<Input
					id="ob-mgmt"
					type="number"
					min={0}
					label="Gestion locative"
					suffix="€"
					bind:value={project.charges.managementFees}
				/>
				<Input
					id="ob-pins"
					type="number"
					min={0}
					label="Assurances"
					suffix="€"
					bind:value={project.charges.insurance}
				/>
				<Input
					id="ob-util"
					type="number"
					min={0}
					label="Factures (électricité, eau…)"
					suffix="€"
					bind:value={project.charges.utilities}
				/>
				<Input
					id="ob-acc"
					type="number"
					min={0}
					label="Honoraires comptables"
					suffix="€"
					bind:value={project.charges.accountingFees}
				/>
				<Input
					id="ob-maint"
					type="number"
					min={0}
					label="Provision pour entretien"
					suffix="€"
					className="md:col-span-2"
					bind:value={project.charges.maintenanceProvision}
				/>
			</div>
		</div>
	</StepCard>

	<InfoBanner variant="info">
		<p>
			Les charges sont en <strong>€ par an</strong>. Une partie peut être récupérée sur le locataire
			selon le bail — le simulateur en tient compte dans les agrégats.
		</p>
	</InfoBanner>
</section>
