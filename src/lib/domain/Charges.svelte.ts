/**
 * Charges annuelles du projet (taxe foncière, copro, gestion, etc.).
 */
export class Charges {
	propertyTax = $state(0);
	coOwnershipFees = $state(0);
	managementFees = $state(0);
	insurance = $state(0);
	utilities = $state(0);
	accountingFees = $state(0);
	maintenanceProvision = $state(0);

	constructor(
		init?: Partial<
			Pick<
				Charges,
				| 'propertyTax'
				| 'coOwnershipFees'
				| 'managementFees'
				| 'insurance'
				| 'utilities'
				| 'accountingFees'
				| 'maintenanceProvision'
			>
		>
	) {
		if (init) {
			if (init.propertyTax != null) this.propertyTax = init.propertyTax;
			if (init.coOwnershipFees != null) this.coOwnershipFees = init.coOwnershipFees;
			if (init.managementFees != null) this.managementFees = init.managementFees;
			if (init.insurance != null) this.insurance = init.insurance;
			if (init.utilities != null) this.utilities = init.utilities;
			if (init.accountingFees != null) this.accountingFees = init.accountingFees;
			if (init.maintenanceProvision != null) this.maintenanceProvision = init.maintenanceProvision;
		}
	}

	get totalAnnualCharges(): number {
		return (
			this.propertyTax +
			this.coOwnershipFees +
			this.managementFees +
			this.insurance +
			this.utilities +
			this.accountingFees +
			this.maintenanceProvision
		);
	}

	get totalRecoverableCharges(): number {
		return this.coOwnershipFees + this.managementFees + this.utilities;
	}

	get chargesUsedForCalculation(): number {
		return this.totalAnnualCharges - this.totalRecoverableCharges;
	}
}
