/**
 * Une ligne de travaux futurs (type, coût, année, fréquence).
 */
export class FutureWork {
	work_type = $state('');
	estimated_cost = $state(0);
	planned_year = $state(0);
	frequency_years = $state(0);

	constructor(init?: Partial<Pick<FutureWork, 'work_type' | 'estimated_cost' | 'planned_year' | 'frequency_years'>>) {
		if (init) {
			if (init.work_type != null) this.work_type = init.work_type;
			if (init.estimated_cost != null) this.estimated_cost = init.estimated_cost;
			if (init.planned_year != null) this.planned_year = init.planned_year;
			if (init.frequency_years != null) this.frequency_years = init.frequency_years;
		}
	}
}
