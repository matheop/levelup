<script lang="ts">
	import {
		simulateProject,
		monthlyPayment,
		type SimulationInput,
		type SimulationResult
	} from '$lib/calculations';
	import type { TaxRegimeName } from '$lib/dbTypes';

	// --- Form state (single project MVP) ---
	let projectName = $state('Mon projet');
	let projectType = $state<'purchase' | 'renovation_only'>('purchase');
	let taxRegime = $state<TaxRegimeName>('LMNP');
	let vacancyRate = $state(0.08);
	let purchasePrice = $state(125000);
	let notaryFees = $state(10000);
	let renovationCost = $state(3000);
	let furnitureCost = $state(7500);
	let loanAmount = $state(115500);
	let interestRate = $state(0.0327);
	let loanDuration = $state(20);
	let loanDeferralMonths = $state(0);
	let bankFees = $state(0);
	let guaranteeFees = $state(0);
	let loanInsuranceMonthly = $state(0);
	let rents = $state<{ label: string; monthly_amount: number }[]>([{ label: 'Loyer principal', monthly_amount: 850 }]);
	let otherIncome = $state(0);
	let propertyTax = $state(51.83);
	let coOwnershipFees = $state(70);
	let managementFees = $state(0);
	let insurance = $state(17);
	let utilities = $state(0);
	let accountingFees = $state(400);
	let maintenanceProvision = $state(500);

	let futureWorks = $state<{ work_type: string; estimated_cost: number; planned_year: number; frequency_years: number }[]>([
		{ work_type: 'Toiture', estimated_cost: 15000, planned_year: 15, frequency_years: 25 }
	]);
	let depreciations = $state<{ asset_type: 'property' | 'renovation' | 'furniture'; depreciable_value: number; depreciation_period: number }[]>([
		{ asset_type: 'property', depreciable_value: 125000, depreciation_period: 25 },
		{ asset_type: 'furniture', depreciable_value: 7500, depreciation_period: 7 }
	]);

	let simulationResult = $state<SimulationResult | null>(null);

	$effect(() => {
		const totalInvestment =
			(projectType === 'purchase' ? purchasePrice + notaryFees : 0) +
			renovationCost +
			(furnitureCost || 0) +
			bankFees +
			guaranteeFees;
		const horizonYears = 25;
		const futureWorksAnnual =
			futureWorks.length === 0
				? 0
				: futureWorks.reduce(
						(s, w) => s + w.estimated_cost / (w.frequency_years || horizonYears),
						0
					);
		const annualRentGross = totalMonthlyRent * 12 * (1 - vacancyRate);
		const input: SimulationInput = {
			regime: taxRegime,
			vacancy_rate: vacancyRate,
			social_contributions_rate: taxRegime === 'SCI_IS' ? 0 : 0.172,
			is_tax_rate: taxRegime === 'SCI_IS' ? 0.25 : null,
			revenue: {
				monthly_rent: totalMonthlyRent,
				other_income: otherIncome,
				ancillary_income: 0
			},
			expenses: {
				property_tax: propertyTax,
				co_ownership_fees: coOwnershipFees,
				management_fees: managementFees,
				insurance: insurance,
				utilities: utilities,
				accounting_fees: accountingFees,
				maintenance_provision: maintenanceProvision
			},
			loan: {
				loan_amount: loanAmount,
				interest_rate: interestRate,
				loan_duration: loanDuration,
				loan_deferral_period: loanDeferralMonths
			},
			depreciation:
				taxRegime === 'NU'
					? []
					: depreciations.map((d) => ({
							depreciable_value: d.depreciable_value,
							depreciation_period: d.depreciation_period
						})),
			future_works_annual_average: futureWorksAnnual,
			total_investment: totalInvestment,
			annual_rent_gross: annualRentGross
		};
		simulationResult = simulateProject(input, horizonYears);
	});

	function addFutureWork() {
		futureWorks = [...futureWorks, { work_type: '', estimated_cost: 0, planned_year: 10, frequency_years: 0 }];
	}
	function removeFutureWork(i: number) {
		futureWorks = futureWorks.filter((_, idx) => idx !== i);
	}
	function addDepreciation() {
		depreciations = [...depreciations, { asset_type: 'property', depreciable_value: 0, depreciation_period: 25 }];
	}
	function removeDepreciation(i: number) {
		depreciations = depreciations.filter((_, idx) => idx !== i);
	}
	function addRent() {
		rents = [...rents, { label: '', monthly_amount: 0 }];
	}
	function removeRent(i: number) {
		rents = rents.filter((_, idx) => idx !== i);
	}

	const totalMonthlyRent = $derived(rents.reduce((s, r) => s + (r.monthly_amount || 0), 0));
	const annualRentGrossBeforeVacancy = $derived(totalMonthlyRent * 12);
	const annualRentAfterVacancy = $derived(totalMonthlyRent * 12 * (1 - vacancyRate));
	const totalProjectCost = $derived(
		(projectType === 'purchase' ? purchasePrice + notaryFees : 0) +
			renovationCost +
			(furnitureCost || 0) +
			bankFees +
			guaranteeFees
	);

	const personalContribution = $derived(totalProjectCost - loanAmount);

	const monthlyWithoutInsurance = $derived(
		loanAmount > 0 && loanDuration > 0
			? monthlyPayment(loanAmount, interestRate, loanDuration)
			: 0
	);
	const monthlyWithInsurance = $derived(monthlyWithoutInsurance + (loanInsuranceMonthly || 0));
	const annualLoanCost = $derived(monthlyWithInsurance * 12);
</script>

<main class="max-w-[1920px] mx-auto p-4 md:p-6 pb-24 space-y-4 flex flex-col min-h-screen">
	<!-- En-tête : nom du projet, type, régime fiscal -->
	<header class="flex-shrink-0 rounded-xl border border-slate-200 bg-slate-800 text-white px-5 py-4 shadow-sm">
		<div class="flex flex-wrap items-center gap-4 md:gap-8">
			<h1 class="text-xl font-semibold">{projectName || 'Sans nom'}</h1>
			<span class="text-slate-300">|</span>
			<span class="text-sm md:text-base">{projectType === 'purchase' ? 'Achat + travaux' : 'Travaux seuls'}</span>
			<span class="text-slate-300">|</span>
			<span class="text-sm md:text-base">{taxRegime === 'LMNP' ? 'LMNP' : taxRegime === 'NU' ? 'Location nue' : 'SCI à l\'IS'}</span>
		</div>
	</header>

	<!-- 3 colonnes scrollables horizontalement -->
	<div class="flex-1 overflow-x-auto overflow-y-hidden pb-2" style="min-height: 0;">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 min-w-0" style="min-width: min(100%, 1200px);">
		<!-- Colonne 1 : Projet, Coûts, Financement -->
		<div class="space-y-6 min-w-[320px] max-h-[70vh] overflow-y-auto overflow-x-hidden">
	<section class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex-shrink-0">
		<h2 class="text-lg font-medium text-slate-700 mb-4">Projet</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="project-name" class="block text-sm text-slate-600 mb-1">Nom</label>
				<input
					id="project-name"
					type="text"
					bind:value={projectName}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				/>
			</div>
			<div>
				<label for="project-type" class="block text-sm text-slate-600 mb-1">Type</label>
				<select
					id="project-type"
					bind:value={projectType}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				>
					<option value="purchase">Achat + travaux</option>
					<option value="renovation_only">Travaux seuls</option>
				</select>
			</div>
			<div>
				<label for="tax-regime" class="block text-sm text-slate-600 mb-1">Régime fiscal</label>
				<select
					id="tax-regime"
					bind:value={taxRegime}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				>
					<option value="LMNP">LMNP</option>
					<option value="NU">Location nue</option>
					<option value="SCI_IS">SCI à l'IS</option>
				</select>
			</div>
		</div>
	</section>

	<!-- Coûts totaux du projet : bloc compact avec tous les champs éditables -->
	<section class="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
		<h2 class="text-lg font-medium text-slate-700 mb-3">Coûts totaux du projet</h2>
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
			{#if projectType === 'purchase'}
				<div>
					<label for="purchase-price" class="block text-slate-500 mb-0.5">Prix d'achat (€)</label>
					<input
						id="purchase-price"
						type="number"
						min="0"
						bind:value={purchasePrice}
						class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white"
					/>
				</div>
				<div>
					<label for="notary-fees" class="block text-slate-500 mb-0.5">Frais de notaire (€)</label>
					<input
						id="notary-fees"
						type="number"
						min="0"
						bind:value={notaryFees}
						class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white"
					/>
				</div>
			{/if}
			<div>
				<label for="renovation-cost" class="block text-slate-500 mb-0.5">Travaux (€)</label>
				<input
					id="renovation-cost"
					type="number"
					min="0"
					bind:value={renovationCost}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white"
				/>
			</div>
			<div>
				<label for="furniture-cost" class="block text-slate-500 mb-0.5">Meubles (€)</label>
				<input
					id="furniture-cost"
					type="number"
					min="0"
					bind:value={furnitureCost}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white"
				/>
			</div>
			<div>
				<label for="bank-fees" class="block text-slate-500 mb-0.5">Frais bancaires (€)</label>
				<input
					id="bank-fees"
					type="number"
					min="0"
					bind:value={bankFees}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white"
				/>
			</div>
			<div>
				<label for="guarantee-fees" class="block text-slate-500 mb-0.5">Frais de caution (€)</label>
				<input
					id="guarantee-fees"
					type="number"
					min="0"
					bind:value={guaranteeFees}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white"
				/>
			</div>
		</div>
		<div class="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
			<span class="font-medium text-slate-700">Total coûts projet</span>
			<span class="text-lg font-semibold text-slate-900">{totalProjectCost.toLocaleString('fr-FR')} €</span>
		</div>
	</section>

	<section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
		<h2 class="text-lg font-medium text-slate-700 mb-4">Financement</h2>
		<div class="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4 max-w-xs">
			<p class="text-slate-500 text-sm mb-0.5">Apport personnel (€)</p>
			<p class="font-semibold text-slate-800 text-lg">{personalContribution.toLocaleString('fr-FR')} €</p>
			<p class="text-xs text-slate-500 mt-1">Coût total du projet − montant emprunté</p>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="loan-amount" class="block text-sm text-slate-600 mb-1">Montant emprunté (€)</label>
				<input
					id="loan-amount"
					type="number"
					min="0"
					bind:value={loanAmount}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				/>
			</div>
			<div>
				<label for="interest-rate" class="block text-sm text-slate-600 mb-1">Taux annuel (ex: 0.034)</label>
				<input
					id="interest-rate"
					type="number"
					step="0.001"
					min="0"
					bind:value={interestRate}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				/>
			</div>
			<div>
				<label for="loan-duration" class="block text-sm text-slate-600 mb-1">Durée (années)</label>
				<input
					id="loan-duration"
					type="number"
					min="1"
					bind:value={loanDuration}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				/>
			</div>
			<div>
				<label for="loan-deferral" class="block text-sm text-slate-600 mb-1">Différé (mois)</label>
				<input
					id="loan-deferral"
					type="number"
					min="0"
					bind:value={loanDeferralMonths}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				/>
			</div>
			<div>
				<label for="loan-insurance" class="block text-sm text-slate-600 mb-1">Assurance emprunteur (€/mois)</label>
				<input
					id="loan-insurance"
					type="number"
					min="0"
					step="0.01"
					bind:value={loanInsuranceMonthly}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				/>
			</div>
		</div>
		<div class="mt-4 pt-4 border-t border-slate-200 rounded-lg bg-slate-50 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
			<div>
				<p class="text-slate-500 mb-0.5">Mensualité hors assurance</p>
				<p class="font-semibold text-slate-800">{monthlyWithoutInsurance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
			</div>
			<div>
				<p class="text-slate-500 mb-0.5">Mensualité avec assurance</p>
				<p class="font-semibold text-slate-800">{monthlyWithInsurance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
			</div>
			<div>
				<p class="text-slate-500 mb-0.5">Coût crédit (€/an)</p>
				<p class="font-semibold text-slate-800">{annualLoanCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
			</div>
		</div>
	</section>

		</div>
		<!-- Colonne 2 : Revenus, Charges -->
		<div class="space-y-6 min-w-[320px] max-h-[70vh] overflow-y-auto overflow-x-hidden">
	<section class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex-shrink-0">
		<h2 class="text-lg font-medium text-slate-700 mb-4">Revenus</h2>
		<p class="text-sm text-slate-600 mb-3">Loyers mensuels (plusieurs lignes possibles)</p>
		<div class="space-y-2 mb-4">
			{#each rents as rent, i (i)}
				<div class="flex flex-wrap gap-2 items-end">
					<input
						type="text"
						bind:value={rent.label}
						placeholder="Libellé (ex. Loyer principal)"
						class="rounded-lg border border-slate-300 px-3 py-2 min-w-[140px] flex-1 text-slate-800"
					/>
					<input
						type="number"
						min="0"
						bind:value={rent.monthly_amount}
						placeholder="€/mois"
						class="rounded-lg border border-slate-300 px-3 py-2 w-28 text-slate-800"
					/>
					<button type="button" onclick={() => removeRent(i)} class="text-red-600 text-sm py-2">Suppr.</button>
				</div>
			{/each}
			<button type="button" onclick={addRent} class="text-slate-600 text-sm underline">+ Ajouter un loyer</button>
		</div>
		<div class="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 inline-block mb-2">
			<span class="text-slate-600 text-sm">Total loyers mensuels</span>
			<span class="ml-2 font-semibold text-slate-800">{totalMonthlyRent.toLocaleString('fr-FR')} €</span>
		</div>
		<div class="mb-4">
			<label for="vacancy-rate" class="block text-sm text-slate-600 mb-1">Vacance locative (%)</label>
			<input
				id="vacancy-rate"
				type="number"
				step="0.01"
				min="0"
				max="1"
				bind:value={vacancyRate}
				class="w-full max-w-[120px] rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
			/>
		</div>
		<div class="grid grid-cols-1 gap-3 mb-4 text-sm">
			<div class="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
				<p class="text-slate-500">Loyer annuel brut (€)</p>
				<p class="font-semibold text-slate-800">{annualRentGrossBeforeVacancy.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</p>
			</div>
			<div class="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
				<p class="text-slate-500">Loyer annuel après vacance (€)</p>
				<p class="font-semibold text-slate-800">{annualRentAfterVacancy.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</p>
			</div>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="other-income" class="block text-sm text-slate-600 mb-1">Autres revenus (€/an)</label>
				<input
					id="other-income"
					type="number"
					min="0"
					bind:value={otherIncome}
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
				/>
			</div>
		</div>
	</section>

	<section class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
		<h2 class="text-lg font-medium text-slate-700 mb-2">Charges</h2>
		<p class="text-sm text-slate-600 mb-4">Charges annuelles (€/an) : taxe, copro, gestion, assurances, factures, comptabilité, provision entretien.</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			<div>
				<label for="property-tax" class="block text-sm text-slate-600 mb-1">Taxe foncière (€/an)</label>
				<input id="property-tax" type="number" min="0" bind:value={propertyTax} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800" />
			</div>
			<div>
				<label for="co-ownership-fees" class="block text-sm text-slate-600 mb-1">Charges de copropriété (€/an)</label>
				<input id="co-ownership-fees" type="number" min="0" bind:value={coOwnershipFees} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800" />
			</div>
			<div>
				<label for="management-fees" class="block text-sm text-slate-600 mb-1">Gestion locative (€/an)</label>
				<input id="management-fees" type="number" min="0" bind:value={managementFees} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800" />
			</div>
			<div>
				<label for="insurance" class="block text-sm text-slate-600 mb-1">Assurances (€/an)</label>
				<input id="insurance" type="number" min="0" bind:value={insurance} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800" />
			</div>
			<div>
				<label for="utilities" class="block text-sm text-slate-600 mb-1">Factures (électricité, eau…) (€/an)</label>
				<input id="utilities" type="number" min="0" bind:value={utilities} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800" />
			</div>
			<div>
				<label for="accounting-fees" class="block text-sm text-slate-600 mb-1">Honoraires comptables (€/an)</label>
				<input id="accounting-fees" type="number" min="0" bind:value={accountingFees} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800" />
			</div>
			<div>
				<label for="maintenance-provision" class="block text-sm text-slate-600 mb-1">Provision pour entretien (€/an)</label>
				<input id="maintenance-provision" type="number" min="0" bind:value={maintenanceProvision} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800" />
			</div>
		</div>
	</section>

		</div>
		<!-- Colonne 3 : Travaux futurs, Amortissements -->
		<div class="space-y-6 min-w-[320px] max-h-[70vh] overflow-y-auto overflow-x-hidden">
	<section class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex-shrink-0">
		<h2 class="text-lg font-medium text-slate-700 mb-4">Travaux futurs</h2>
		{#each futureWorks as work, i (i)}
			<div class="flex flex-wrap gap-2 items-end mb-2">
				<input type="text" bind:value={work.work_type} placeholder="Type" class="rounded-lg border border-slate-300 px-3 py-2 w-32 text-slate-800" />
				<input type="number" bind:value={work.estimated_cost} placeholder="Coût" class="rounded-lg border border-slate-300 px-3 py-2 w-28 text-slate-800" />
				<input type="number" bind:value={work.planned_year} placeholder="Année" class="rounded-lg border border-slate-300 px-3 py-2 w-24 text-slate-800" />
				<input type="number" bind:value={work.frequency_years} placeholder="Fréq. ans" class="rounded-lg border border-slate-300 px-3 py-2 w-24 text-slate-800" />
				<button type="button" onclick={() => removeFutureWork(i)} class="text-red-600 text-sm">Suppr.</button>
			</div>
		{/each}
		<button type="button" onclick={addFutureWork} class="text-slate-600 text-sm underline">+ Ajouter une ligne</button>
	</section>

	{#if taxRegime !== 'NU'}
		<section class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex-shrink-0">
			<h2 class="text-lg font-medium text-slate-700 mb-4">Amortissements</h2>
			{#each depreciations as dep, i (i)}
				<div class="flex flex-wrap gap-2 items-end mb-2">
					<select bind:value={dep.asset_type} class="rounded-lg border border-slate-300 px-3 py-2 w-36 text-slate-800">
						<option value="property">Bien</option>
						<option value="renovation">Travaux</option>
						<option value="furniture">Meubles</option>
					</select>
					<input type="number" bind:value={dep.depreciable_value} placeholder="Valeur" class="rounded-lg border border-slate-300 px-3 py-2 w-28 text-slate-800" />
					<input type="number" bind:value={dep.depreciation_period} placeholder="Durée (ans)" class="rounded-lg border border-slate-300 px-3 py-2 w-24 text-slate-800" />
					<button type="button" onclick={() => removeDepreciation(i)} class="text-red-600 text-sm">Suppr.</button>
				</div>
			{/each}
			<button type="button" onclick={addDepreciation} class="text-slate-600 text-sm underline">+ Ajouter</button>
		</section>
	{/if}

		</div>
		</div>
	</div>

	<!-- Résultats : pleine largeur, toujours visibles en bas -->
	{#if simulationResult}
		{@const chartData = simulationResult.resultsByYear.slice(0, 10)}
		{@const maxCf = Math.max(...chartData.map((r) => Math.abs(r.net_cashflow)), 1)}
		{@const firstYearNet = simulationResult.resultsByYear[0]?.net_cashflow ?? 0}
		{@const monthlyCashflow = firstYearNet / 12}
		<section class="flex-shrink-0 w-full bg-white rounded-xl border border-slate-200 p-6 shadow-sm mt-4">
			<h2 class="text-lg font-medium text-slate-700 mb-4">Résultats</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div class="rounded-lg bg-slate-50 p-4">
					<p class="text-sm text-slate-500">Rendement brut</p>
					<p class="text-xl font-semibold text-slate-800">{simulationResult.gross_yield.toFixed(2)} %</p>
				</div>
				<div class="rounded-lg bg-slate-50 p-4">
					<p class="text-sm text-slate-500">Rendement net</p>
					<p class="text-xl font-semibold text-slate-800">{simulationResult.net_yield.toFixed(2)} %</p>
				</div>
				<div class="rounded-lg bg-slate-50 p-4">
					<p class="text-sm text-slate-500">TRI</p>
					<p class="text-xl font-semibold text-slate-800">
						{simulationResult.irr != null ? (simulationResult.irr * 100).toFixed(2) + ' %' : '–'}
					</p>
				</div>
				<div class="rounded-lg bg-slate-50 p-4">
					<p class="text-sm text-slate-500">Investissement total</p>
					<p class="text-xl font-semibold text-slate-800">{simulationResult.total_investment.toLocaleString('fr-FR')} €</p>
				</div>
			</div>
			<!-- Le cash-flow : mensuel et annuel (vert / rouge) -->
			<div class="mb-6">
				<h3 class="text-base font-medium text-slate-700 mb-3">Le cash-flow</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="rounded-lg border border-slate-200 p-4 {monthlyCashflow >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}">
						<p class="text-sm text-slate-600 mb-1">Cash-flow mensuel (année 1)</p>
						<p class="text-xl font-semibold {monthlyCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'}">{monthlyCashflow.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
					</div>
					<div class="rounded-lg border border-slate-200 p-4 {firstYearNet >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}">
						<p class="text-sm text-slate-600 mb-1">Cash-flow annuel (année 1)</p>
						<p class="text-xl font-semibold {firstYearNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}">{firstYearNet.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
					</div>
				</div>
			</div>
			<!-- Chart: net cash-flow first 10 years -->
			<div class="mb-6">
				<p class="text-sm text-slate-600 mb-2">Évolution du cash-flow net (10 premières années)</p>
				<div class="flex gap-1 items-end h-24">
					{#each chartData as row (row.year)}
						<div class="flex-1 flex flex-col items-center gap-0.5">
							<div
								class="w-full rounded-t min-h-[2px] {row.net_cashflow >= 0 ? 'bg-emerald-500' : 'bg-rose-400'}"
								style="height: {Math.abs(row.net_cashflow) / maxCf * 80}px"
							></div>
							<span class="text-xs text-slate-500">{row.year}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-slate-700">
					<thead>
						<tr class="border-b border-slate-200">
							<th class="text-left py-2">Année</th>
							<th class="text-right py-2">Cash-flow brut (€)</th>
							<th class="text-right py-2">Cash-flow net (€)</th>
							<th class="text-right py-2">Déficit déductible (€)</th>
						</tr>
					</thead>
					<tbody>
						{#each simulationResult.resultsByYear.slice(0, 15) as row (row.year)}
							<tr class="border-b border-slate-100">
								<td class="py-2">{row.year}</td>
								<td class="text-right py-2">{row.gross_cashflow.toLocaleString('fr-FR')}</td>
								<td class="text-right py-2 font-medium {row.net_cashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'}">{row.net_cashflow.toLocaleString('fr-FR')}</td>
								<td class="text-right py-2">{row.tax_deductible_deficit > 0 ? row.tax_deductible_deficit.toLocaleString('fr-FR') : '–'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if simulationResult.resultsByYear.length > 15}
					<p class="text-slate-500 text-sm mt-2">… et {simulationResult.resultsByYear.length - 15} années de plus.</p>
				{/if}
			</div>
		</section>

		<!-- Pied de page : fixé en bas de l'écran -->
		<footer class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-700 bg-slate-800 text-white px-5 py-3 shadow-lg">
			<div class="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
				<div class="text-center">
					<p class="text-slate-400 text-sm">Cash-flow mensuel (an 1)</p>
					<p class="text-lg font-semibold {monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}">{monthlyCashflow.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
				</div>
				<span class="text-slate-500 hidden md:inline">|</span>
				<div class="text-center">
					<p class="text-slate-400 text-sm">Cash-flow annuel (an 1)</p>
					<p class="text-lg font-semibold {firstYearNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}">{firstYearNet.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
				</div>
				<span class="text-slate-500 hidden md:inline">|</span>
				<div class="text-center">
					<p class="text-slate-400 text-sm">Coût total du projet</p>
					<p class="text-lg font-semibold text-white">{simulationResult.total_investment.toLocaleString('fr-FR')} €</p>
				</div>
			</div>
		</footer>
	{/if}
</main>
