export type TaxRegimeName = 'LMNP' | 'NU' | 'SCI_IS';

export interface TaxRegime {
	id: number;
	name: TaxRegimeName;
	description: string | null;
	allows_deficit_deduction: boolean;
	tax_rate: number | null;
	social_contributions_rate: number;
}

export type ProjectType = 'purchase' | 'renovation_only';

export interface Project {
	id: number;
	name: string;
	description: string | null;
	creation_date: string;
	tax_regime_id: number;
	user_id: number | null;
	project_type: ProjectType;
	vacancy_rate: number;
	inflation_rate: number;
	sc_formation_cost: number | null;
}

export interface ProjectParticipant {
	id: number;
	project_id: number;
	participant_name: string;
	ownership_percentage: number;
}

export interface Property {
	id: number;
	project_id: number;
	purchase_price: number;
	notary_fees: number;
	acquisition_date: string;
	initial_dpe: string | null;
	diagnostic_cost: number | null;
}

export type FinancingType = 'purchase' | 'renovation';

export interface Financing {
	id: number;
	project_id: number;
	participant_id: number | null;
	financing_type: FinancingType;
	personal_contribution: number;
	loan_amount: number;
	interest_rate: number;
	loan_duration: number;
	bank_fees: number;
	guarantee_fees: number;
	loan_deferral_period: number;
	early_repayment_fee: number;
}

export interface PartnerLoan {
	id: number;
	project_id: number;
	participant_id: number;
	loan_amount: number;
	interest_rate: number;
	duration_months: number | null;
	is_repaid: boolean;
}

export type RevenueType = 'rental' | 'resale';

export interface Revenue {
	id: number;
	project_id: number;
	revenue_type: RevenueType;
	monthly_rent: number | null;
	resale_price: number | null;
	other_income: number;
	rent_indexation_rate: number;
	ancillary_income: number;
}

export interface Expenses {
	id: number;
	project_id: number;
	property_tax: number;
	co_ownership_fees: number;
	management_fees: number;
	insurance: number;
	utilities: number;
	accounting_fees: number;
	maintenance_provision: number;
	charge_indexation_rate: number;
}

export interface FutureWork {
	id: number;
	project_id: number;
	work_type: string;
	estimated_cost: number;
	planned_year: number;
	frequency_years: number;
}

export type AssetType = 'property' | 'renovation' | 'furniture';
export type DepreciationMethod = 'linear' | 'declining';

export interface Depreciation {
	id: number;
	project_id: number;
	asset_type: AssetType;
	depreciable_value: number;
	depreciation_period: number;
	method: DepreciationMethod;
	start_date: string;
}

export interface ResultRow {
	id: number;
	project_id: number;
	year: number;
	gross_cashflow: number | null;
	net_cashflow: number | null;
	gross_yield: number | null;
	net_yield: number | null;
	irr: number | null;
	tax_deductible_deficit: number | null;
	details: unknown | null;
}

export interface ParticipantResult {
	id: number;
	result_id: number;
	participant_id: number;
	gross_cashflow: number | null;
	net_cashflow: number | null;
	tax_impact: number | null;
}

