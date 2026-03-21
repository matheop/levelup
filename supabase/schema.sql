  -- Supabase schema (inputs-only core)
  -- All primary keys and project_id FKs use uuid with default gen_random_uuid() (PG 13+).

  create table if not exists public.tax_regimes (
    id                         uuid primary key default gen_random_uuid(),
    name                       text        not null unique,
    description                text,
    allows_deficit_deduction   boolean     not null default false,
    tax_rate                   numeric(5,4),
    social_contributions_rate  numeric(5,4) not null default 0.1860
  );

  create table if not exists public.projects (
    id                           uuid primary key default gen_random_uuid(),
    name                         text        not null,
    description                  text,
    creation_date                date        not null default current_date,
    created_at                   timestamptz not null default now(),
    updated_at                   timestamptz not null default now(),
    tax_regime_id                uuid        not null references public.tax_regimes(id),
    user_id                      uuid        not null references auth.users(id) on delete cascade,
    project_type                 text        not null check (project_type in ('purchase', 'renovation_only')),
    lmnp_sub_regime              text        check (lmnp_sub_regime in ('micro_bic', 'reel_simplifie')),
    tax_bracket_rate             numeric(5,4) default 0.30,
    social_contributions_rate    numeric(5,4) default 0.1860,
    vacancy_rate                 numeric(5,4) not null default 0.08,
    inflation_rate               numeric(5,4) not null default 0.02,
    sc_formation_cost            numeric(12,2) default 0
  );

  create table if not exists public.property (
    id               uuid primary key default gen_random_uuid(),
    project_id       uuid      not null unique references public.projects(id) on delete cascade,
    purchase_price   numeric(14,2) not null,
    notary_fees      numeric(14,2) not null,
    agency_fees      numeric(14,2) default 0,
    acquisition_date date        not null,
    initial_dpe      text,
    diagnostic_cost  numeric(12,2)
  );

  create table if not exists public.renovation_projects (
    id                  uuid primary key default gen_random_uuid(),
    project_id          uuid      not null unique references public.projects(id) on delete cascade,
    renovation_cost     numeric(14,2) not null,
    furniture_cost      numeric(14,2),
    permit_required     boolean       not null default false,
    permit_cost         numeric(12,2),
    start_date          date,
    end_date            date,
    target_dpe          text,
    energy_tax_credit   numeric(12,2),
    contingency_budget  numeric(14,2)
  );

  create table if not exists public.financing (
    id                     uuid primary key default gen_random_uuid(),
    project_id             uuid      not null references public.projects(id) on delete cascade,
    financing_type         text        not null check (financing_type in ('purchase', 'renovation')),
    personal_contribution  numeric(14,2) default 0,
    loan_amount            numeric(14,2) not null,
    interest_rate          numeric(6,4)  not null,
    loan_duration          integer       not null,
    bank_fees              numeric(12,2) default 0,
    guarantee_fees         numeric(12,2) default 0,
    loan_deferral_period   integer       default 0,
    loan_insurance_monthly numeric(12,2) default 0,
    early_repayment_fee    numeric(6,4)  default 0
  );

  create table if not exists public.revenues (
    id                     uuid primary key default gen_random_uuid(),
    project_id             uuid      not null references public.projects(id) on delete cascade,
    revenue_type           text        not null check (revenue_type in ('rental', 'resale')),
    monthly_rent           numeric(12,2),
    resale_price           numeric(14,2),
    other_income           numeric(12,2) default 0,
    rent_indexation_rate   numeric(5,4)  default 0,
    ancillary_income       numeric(12,2) default 0
  );

  create table if not exists public.expenses (
    id                     uuid primary key default gen_random_uuid(),
    project_id             uuid      not null unique references public.projects(id) on delete cascade,
    property_tax           numeric(12,2) default 0,
    co_ownership_fees      numeric(12,2) default 0,
    management_fees        numeric(12,2) default 0,
    insurance              numeric(12,2) default 0,
    utilities              numeric(12,2) default 0,
    accounting_fees        numeric(12,2) default 0,
    maintenance_provision  numeric(12,2) default 0,
    charge_indexation_rate numeric(5,4)  default 0
  );

  create table if not exists public.future_works (
    id               uuid primary key default gen_random_uuid(),
    project_id       uuid      not null references public.projects(id) on delete cascade,
    work_type        text        not null,
    estimated_cost   numeric(14,2) not null,
    planned_year     integer      not null,
    frequency_years  integer      default 0
  );

  create or replace function public.set_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;

  drop trigger if exists projects_set_updated_at on public.projects;
  create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

  -- RLS
  alter table public.tax_regimes enable row level security;
  alter table public.projects enable row level security;
  alter table public.property enable row level security;
  alter table public.renovation_projects enable row level security;
  alter table public.financing enable row level security;
  alter table public.revenues enable row level security;
  alter table public.expenses enable row level security;
  alter table public.future_works enable row level security;

  drop policy if exists tax_regimes_select_all on public.tax_regimes;
  create policy tax_regimes_select_all on public.tax_regimes
  for select using (true);

  drop policy if exists projects_select_own on public.projects;
  drop policy if exists projects_insert_own on public.projects;
  drop policy if exists projects_update_own on public.projects;
  drop policy if exists projects_delete_own on public.projects;

  create policy projects_select_own on public.projects
  for select using (user_id = auth.uid());
  create policy projects_insert_own on public.projects
  for insert with check (user_id = auth.uid());
  create policy projects_update_own on public.projects
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy projects_delete_own on public.projects
  for delete using (user_id = auth.uid());

  drop policy if exists property_owner_access on public.property;
  create policy property_owner_access on public.property
  for all using (
    exists (select 1 from public.projects p where p.id = property.project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = property.project_id and p.user_id = auth.uid())
  );

  drop policy if exists renovation_projects_owner_access on public.renovation_projects;
  create policy renovation_projects_owner_access on public.renovation_projects
  for all using (
    exists (select 1 from public.projects p where p.id = renovation_projects.project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = renovation_projects.project_id and p.user_id = auth.uid())
  );

  drop policy if exists financing_owner_access on public.financing;
  create policy financing_owner_access on public.financing
  for all using (
    exists (select 1 from public.projects p where p.id = financing.project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = financing.project_id and p.user_id = auth.uid())
  );

  drop policy if exists revenues_owner_access on public.revenues;
  create policy revenues_owner_access on public.revenues
  for all using (
    exists (select 1 from public.projects p where p.id = revenues.project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = revenues.project_id and p.user_id = auth.uid())
  );

  drop policy if exists expenses_owner_access on public.expenses;
  create policy expenses_owner_access on public.expenses
  for all using (
    exists (select 1 from public.projects p where p.id = expenses.project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = expenses.project_id and p.user_id = auth.uid())
  );

  drop policy if exists future_works_owner_access on public.future_works;
  create policy future_works_owner_access on public.future_works
  for all using (
    exists (select 1 from public.projects p where p.id = future_works.project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = future_works.project_id and p.user_id = auth.uid())
  );

  -- API / PostgREST: apres reset du schema public, reattribuer les droits (sinon INSERT/SELECT peuvent echouer).
  grant usage on schema public to postgres, anon, authenticated, service_role;
  grant all on all tables in schema public to postgres, anon, authenticated, service_role;
  grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
  grant all on all routines in schema public to postgres, anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
  alter default privileges in schema public grant all on routines to postgres, anon, authenticated, service_role;
