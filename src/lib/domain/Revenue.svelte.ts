/**
 * Une entrée de loyer mensuel (réactive pour le binding).
 */
export class RentEntry {
	monthly_amount = $state(0);

	constructor(monthly_amount = 0) {
		this.monthly_amount = monthly_amount;
	}
}

/**
 * Une entrée d'autre revenu (réactive pour le binding).
 */
export class OtherIncomeEntry {
	label = $state('');
	amount = $state(0);

	constructor(init?: { label?: string; amount?: number }) {
		if (init?.label != null) this.label = init.label;
		if (init?.amount != null) this.amount = init.amount;
	}
}

/**
 * Revenus : loyers, autres revenus, taux de vacance.
 */
export class Revenue {
	rents = $state<RentEntry[]>([]);
	otherIncomes = $state<OtherIncomeEntry[]>([]);
	vacancyRate = $state(0);

	constructor(init?: {
		rents?: { monthly_amount: number }[];
		otherIncomes?: { label: string; amount: number }[];
		vacancyRate?: number;
	}) {
		if (init?.rents?.length) {
			this.rents = init.rents.map((r) => new RentEntry(r.monthly_amount));
		}
		if (init?.otherIncomes?.length) {
			this.otherIncomes = init.otherIncomes.map(
				(o) => new OtherIncomeEntry({ label: o.label, amount: o.amount })
			);
		}
		if (init?.vacancyRate != null) this.vacancyRate = init.vacancyRate;
	}

	get totalMonthlyRent(): number {
		return this.rents.reduce((s, r) => s + (r.monthly_amount || 0), 0);
	}

	get totalOtherIncome(): number {
		return this.otherIncomes.reduce((s, r) => s + (r.amount || 0), 0);
	}

	/** Loyers annuels après vacance (hors autres revenus). */
	get annualRentAfterVacancy(): number {
		return this.totalMonthlyRent * 12 * (1 - this.vacancyRate);
	}

	get annualRevenueAfterVacancy(): number {
		return this.annualRentAfterVacancy + this.totalOtherIncome;
	}
}
