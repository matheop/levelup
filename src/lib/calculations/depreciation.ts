/**
 * Linear depreciation: annual amount = depreciable_value / depreciation_period.
 */

export interface DepreciationRow {
	depreciable_value: number;
	depreciation_period: number;
}

/**
 * Sum of annual depreciation from multiple assets (linear only).
 */
export function annualDepreciationTotal(rows: DepreciationRow[]): number {
	return rows.reduce((sum, row) => {
		if (row.depreciation_period <= 0) return sum;
		return sum + row.depreciable_value / row.depreciation_period;
	}, 0);
}
