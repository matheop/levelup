import type { Charges } from '$lib/domain';

export type ChargeRow = { key: string; label: string; value: number };

type ChargeKey =
	| 'propertyTax'
	| 'coOwnershipFees'
	| 'managementFees'
	| 'insurance'
	| 'utilities'
	| 'accountingFees'
	| 'maintenanceProvision';

const CHARGE_DEFS: { key: ChargeKey; label: string }[] = [
	{ key: 'propertyTax', label: 'Taxe foncière' },
	{ key: 'coOwnershipFees', label: 'Charges de copropriété' },
	{ key: 'managementFees', label: 'Gestion locative' },
	{ key: 'insurance', label: 'Assurances' },
	{ key: 'utilities', label: 'Factures (électricité, eau…)' },
	{ key: 'accountingFees', label: 'Honoraires comptables' },
	{ key: 'maintenanceProvision', label: 'Provision pour entretien' }
];

export function getPositiveChargeRows(charges: Charges): ChargeRow[] {
	return CHARGE_DEFS.filter((d) => charges[d.key] > 0).map((d) => ({
		key: d.key,
		label: d.label,
		value: charges[d.key]
	}));
}
