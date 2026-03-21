import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectUserInputs } from '$lib/domain/Project.svelte';
import type { TaxRegimeName } from '$lib/dbTypes';

export interface ProjectListItem {
	id: string;
	name: string;
	updated_at: string;
}

interface ProjectRow {
	id: string;
	name: string | null;
	project_type: string;
	tax_regime_id: string;
	lmnp_sub_regime: string | null;
	vacancy_rate: number | null;
	tax_bracket_rate: number | null;
	social_contributions_rate: number | null;
}

interface PropertyRow {
	purchase_price?: number | null;
	notary_fees?: number | null;
	agency_fees?: number | null;
}

interface RenovationRow {
	renovation_cost?: number | null;
	furniture_cost?: number | null;
}

interface FinancingRow {
	loan_amount?: number | null;
	interest_rate?: number | null;
	loan_duration?: number | null;
	loan_deferral_period?: number | null;
	loan_insurance_monthly?: number | null;
	bank_fees?: number | null;
}

interface RevenueRow {
	monthly_rent?: number | null;
	other_income?: number | null;
}

interface ExpensesRow {
	property_tax?: number | null;
	co_ownership_fees?: number | null;
	management_fees?: number | null;
	insurance?: number | null;
	utilities?: number | null;
	accounting_fees?: number | null;
	maintenance_provision?: number | null;
}

interface FutureWorkRow {
	work_type: string;
	estimated_cost: number;
	planned_year: number;
	frequency_years: number | null;
}

async function getTaxRegimeIdByName(
	supabase: SupabaseClient,
	name: TaxRegimeName
): Promise<string> {
	// Avoid .single(): 0 rows → PGRST116; 2+ rows (duplicate seed) → same error.
	const { data, error } = await supabase
		.from('tax_regimes')
		.select('id')
		.eq('name', name)
		.limit(1);
	if (error) throw new Error(error.message);
	const row = data?.[0];
	if (!row) {
		throw new Error(
			`Aucun regime fiscal "${name}" en base. Execute supabase/seed.sql (tax_regimes).`
		);
	}
	return row.id as string;
}

async function getTaxRegimeNameById(
	supabase: SupabaseClient,
	id: string
): Promise<TaxRegimeName> {
	const { data, error } = await supabase
		.from('tax_regimes')
		.select('name')
		.eq('id', id)
		.limit(1);
	if (error) throw new Error(error.message);
	const row = data?.[0];
	if (!row) {
		throw new Error(`Tax regime id ${id} not found`);
	}
	return row.name as TaxRegimeName;
}

function sumMonthlyRents(inputs: ProjectUserInputs): number {
	return inputs.revenue.rents.reduce((s, r) => s + (r.monthly_amount || 0), 0);
}

function sumOtherIncomes(inputs: ProjectUserInputs): number {
	return inputs.revenue.otherIncomes.reduce((s, o) => s + (o.amount || 0), 0);
}

async function listUserProjects(
	supabase: SupabaseClient
): Promise<ProjectListItem[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('id, name, updated_at')
		.order('updated_at', { ascending: false });
	if (error) throw error;
	return (data ?? []) as ProjectListItem[];
}

async function createProjectFromInputsServer(
	supabase: SupabaseClient,
	inputs: ProjectUserInputs,
	userId: string
): Promise<string> {
	const taxRegimeId = await getTaxRegimeIdByName(supabase, inputs.taxRegime);
	// Avoid .single() on RETURNING: 0 rows if RLS blocks SELECT on the new row → PGRST116.
	const { data: insertedRows, error: projectError } = await supabase
		.from('projects')
		.insert({
			name: inputs.projectName,
			project_type: inputs.projectType,
			tax_regime_id: taxRegimeId,
			user_id: userId,
			lmnp_sub_regime: inputs.lmnpSubRegime,
			tax_bracket_rate: inputs.taxes.taxBracketRate,
			social_contributions_rate: inputs.taxes.socialContributionsRate,
			vacancy_rate: inputs.revenue.vacancyRate
		})
		.select('id');
	if (projectError) throw projectError;

	const projectId = insertedRows?.[0]?.id as string | undefined;
	if (!projectId) {
		throw new Error(
			'Insert projet OK mais aucune ligne renvoyee (souvent RLS: policy SELECT sur projects pour auth.uid()). Verifie projects_select_own et que user_id = JWT sub.'
		);
	}
	await upsertProjectInputsServer(supabase, projectId, inputs);
	return projectId;
}

async function updateProjectInputsServer(
	supabase: SupabaseClient,
	projectId: string,
	inputs: ProjectUserInputs
): Promise<void> {
	const taxRegimeId = await getTaxRegimeIdByName(supabase, inputs.taxRegime);
	const { error } = await supabase
		.from('projects')
		.update({
			name: inputs.projectName,
			project_type: inputs.projectType,
			tax_regime_id: taxRegimeId,
			lmnp_sub_regime: inputs.lmnpSubRegime,
			tax_bracket_rate: inputs.taxes.taxBracketRate,
			social_contributions_rate: inputs.taxes.socialContributionsRate,
			vacancy_rate: inputs.revenue.vacancyRate
		})
		.eq('id', projectId);
	if (error) throw error;

	await upsertProjectInputsServer(supabase, projectId, inputs);
}

async function upsertProjectInputsServer(
	supabase: SupabaseClient,
	projectId: string,
	inputs: ProjectUserInputs
) {
	if (inputs.projectType === 'purchase') {
		const { error: propertyError } = await supabase.from('property').upsert(
			{
				project_id: projectId,
				purchase_price: inputs.cost.purchasePrice,
				notary_fees: inputs.cost.notaryFees,
				agency_fees: inputs.cost.agencyFees ?? 0,
				acquisition_date: new Date().toISOString().slice(0, 10)
			},
			{ onConflict: 'project_id' }
		);
		if (propertyError) throw propertyError;
	}

	const { error: renoError } = await supabase.from('renovation_projects').upsert(
		{
			project_id: projectId,
			renovation_cost: inputs.cost.renovationCost ?? 0,
			furniture_cost: inputs.cost.furnitureCost ?? 0
		},
		{ onConflict: 'project_id' }
	);
	if (renoError) throw renoError;

	const { error: expensesError } = await supabase.from('expenses').upsert(
		{
			project_id: projectId,
			property_tax: inputs.charges.propertyTax,
			co_ownership_fees: inputs.charges.coOwnershipFees,
			management_fees: inputs.charges.managementFees,
			insurance: inputs.charges.insurance,
			utilities: inputs.charges.utilities,
			accounting_fees: inputs.charges.accountingFees,
			maintenance_provision: inputs.charges.maintenanceProvision
		},
		{ onConflict: 'project_id' }
	);
	if (expensesError) throw expensesError;

	const { error: deleteFinancingError } = await supabase
		.from('financing')
		.delete()
		.eq('project_id', projectId);
	if (deleteFinancingError) throw deleteFinancingError;
	if (inputs.financings.length > 0) {
		const { error: financingError } = await supabase.from('financing').insert(
			inputs.financings.map((f) => ({
				project_id: projectId,
				financing_type: 'purchase',
				bank_fees: inputs.cost.bankFees ?? 0,
				loan_amount: f.loanAmount,
				interest_rate: f.interestRate,
				loan_duration: f.loanDuration,
				loan_deferral_period: f.loanDeferralMonths,
				loan_insurance_monthly: f.loanInsuranceMonthly
			}))
		);
		if (financingError) throw financingError;
	}

	const { error: deleteRevenuesError } = await supabase
		.from('revenues')
		.delete()
		.eq('project_id', projectId);
	if (deleteRevenuesError) throw deleteRevenuesError;
	const { error: revenuesError } = await supabase.from('revenues').insert({
		project_id: projectId,
		revenue_type: 'rental',
		monthly_rent: sumMonthlyRents(inputs),
		other_income: sumOtherIncomes(inputs),
		ancillary_income: 0
	});
	if (revenuesError) throw revenuesError;

	const { error: deleteWorksError } = await supabase
		.from('future_works')
		.delete()
		.eq('project_id', projectId);
	if (deleteWorksError) throw deleteWorksError;
	if (inputs.futureWorks.length > 0) {
		const { error: worksError } = await supabase.from('future_works').insert(
			inputs.futureWorks.map((w) => ({
				project_id: projectId,
				work_type: w.work_type,
				estimated_cost: w.estimated_cost,
				planned_year: w.planned_year,
				frequency_years: w.frequency_years
			}))
		);
		if (worksError) throw worksError;
	}
}

async function getProjectByIdServer(
	supabase: SupabaseClient,
	id: string
): Promise<ProjectUserInputs> {
	const { data: projectRows, error: projectError } = await supabase
		.from('projects')
		.select(
			'id, name, project_type, tax_regime_id, lmnp_sub_regime, vacancy_rate, tax_bracket_rate, social_contributions_rate'
		)
		.eq('id', id)
		.limit(1);
	if (projectError) throw projectError;
	const project = projectRows?.[0];
	if (!project) {
		throw new Error('Projet introuvable ou acces refuse (RLS).');
	}

	const p = project as ProjectRow;

	const taxRegime = await getTaxRegimeNameById(supabase, p.tax_regime_id);

	const [
		{ data: property },
		{ data: reno },
		{ data: financingRows },
		{ data: revenues },
		{ data: expenses },
		{ data: works }
	] = await Promise.all([
		supabase.from('property').select('*').eq('project_id', id).maybeSingle(),
		supabase
			.from('renovation_projects')
			.select('*')
			.eq('project_id', id)
			.maybeSingle(),
		supabase
			.from('financing')
			.select('*')
			.eq('project_id', id)
			.order('id', { ascending: true }),
		supabase
			.from('revenues')
			.select('*')
			.eq('project_id', id)
			.eq('revenue_type', 'rental')
			.limit(1)
			.maybeSingle(),
		supabase.from('expenses').select('*').eq('project_id', id).maybeSingle(),
		supabase
			.from('future_works')
			.select('*')
			.eq('project_id', id)
			.order('planned_year', { ascending: true })
	]);

	const financing = (financingRows ?? []) as FinancingRow[];
	const primary = financing[0];
	const prop = property as PropertyRow | null;
	const renoRow = reno as RenovationRow | null;
	const rev = revenues as RevenueRow | null;
	const exp = expenses as ExpensesRow | null;

	return {
		id: p.id,
		projectName: p.name ?? 'Projet',
		projectType: p.project_type as 'purchase' | 'renovation_only',
		taxRegime,
		lmnpSubRegime:
			(p.lmnp_sub_regime as 'micro_bic' | 'reel_simplifie' | null) ??
			'reel_simplifie',
		cost: {
			purchasePrice: prop?.purchase_price ?? 0,
			notaryFees: prop?.notary_fees ?? 0,
			agencyFees: prop?.agency_fees ?? 0,
			renovationCost: renoRow?.renovation_cost ?? 0,
			furnitureCost: renoRow?.furniture_cost ?? 0,
			bankFees: primary?.bank_fees ?? 0
		},
		financings:
			financing.length > 0
				? financing.map((f) => ({
						loanAmount: f.loan_amount ?? 0,
						interestRate: f.interest_rate ?? 0,
						loanDuration: f.loan_duration ?? 20,
						loanDeferralMonths: f.loan_deferral_period ?? 0,
						loanInsuranceMonthly: f.loan_insurance_monthly ?? 0
					}))
				: [
						{
							loanAmount: 0,
							interestRate: 0,
							loanDuration: 20,
							loanDeferralMonths: 0,
							loanInsuranceMonthly: 0
						}
					],
		revenue: {
			rents: [{ monthly_amount: rev?.monthly_rent ?? 0 }],
			otherIncomes:
				(rev?.other_income ?? 0) > 0
					? [{ label: 'Autres revenus', amount: rev?.other_income ?? 0 }]
					: [],
			vacancyRate: p.vacancy_rate ?? 0
		},
		charges: {
			propertyTax: exp?.property_tax ?? 0,
			coOwnershipFees: exp?.co_ownership_fees ?? 0,
			managementFees: exp?.management_fees ?? 0,
			insurance: exp?.insurance ?? 0,
			utilities: exp?.utilities ?? 0,
			accountingFees: exp?.accounting_fees ?? 0,
			maintenanceProvision: exp?.maintenance_provision ?? 0
		},
		taxes: {
			taxBracketRate: p.tax_bracket_rate ?? 0.3,
			socialContributionsRate: p.social_contributions_rate ?? 0.186
		},
		futureWorks: ((works ?? []) as FutureWorkRow[]).map((w) => ({
			work_type: w.work_type,
			estimated_cost: w.estimated_cost,
			planned_year: w.planned_year,
			frequency_years: w.frequency_years ?? 0
		}))
	};
}

async function deleteProjectServer(
	supabase: SupabaseClient,
	id: string
): Promise<void> {
	const { error } = await supabase.from('projects').delete().eq('id', id);
	if (error) throw error;
}

export function createProjectsRepository(supabase: SupabaseClient) {
	return {
		listUserProjects: () => listUserProjects(supabase),
		createProjectFromInputs: (inputs: ProjectUserInputs, userId: string) =>
			createProjectFromInputsServer(supabase, inputs, userId),
		updateProjectInputs: (projectId: string, inputs: ProjectUserInputs) =>
			updateProjectInputsServer(supabase, projectId, inputs),
		getProjectById: (id: string) => getProjectByIdServer(supabase, id),
		deleteProject: (id: string) => deleteProjectServer(supabase, id)
	};
}
