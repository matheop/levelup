-- Supabase schema for real estate simulator
-- Run this in the Supabase SQL editor for project jvtvgcwfeyhbctldmgpj

create table if not exists tax_regimes (
  id                         bigserial primary key,
  name                       text        not null unique,
  description                text,
  allows_deficit_deduction   boolean     not null default false,
  tax_rate                   numeric(5,4),
  social_contributions_rate  numeric(5,4) not null default 0.1720
);

create table if not exists projects (
  id                bigserial primary key,
  name              text        not null,
  description       text,
  creation_date     date        not null default current_date,
  tax_regime_id     bigint      not null references tax_regimes(id),
  user_id           bigint,
  project_type      text        not null check (project_type in ('purchase', 'renovation_only')),
  vacancy_rate      numeric(5,4)   not null default 0.08,
  inflation_rate    numeric(5,4)   not null default 0.02,
  sc_formation_cost numeric(12,2)  default 0
);

create table if not exists project_participants (
  id                  bigserial primary key,
  project_id          bigint      not null references projects(id) on delete cascade,
  participant_name    text        not null,
  ownership_percentage numeric(6,3) not null
);

create table if not exists property (
  id             bigserial primary key,
  project_id     bigint      not null unique references projects(id) on delete cascade,
  purchase_price numeric(14,2) not null,
  notary_fees    numeric(14,2) not null,
  acquisition_date date       not null,
  initial_dpe    text,
  diagnostic_cost numeric(12,2)
);

create table if not exists renovation_projects (
  id                bigserial primary key,
  project_id        bigint      not null unique references projects(id) on delete cascade,
  renovation_cost   numeric(14,2) not null,
  furniture_cost    numeric(14,2),
  permit_required   boolean       not null default false,
  permit_cost       numeric(12,2),
  start_date        date,
  end_date          date,
  target_dpe        text,
  energy_tax_credit numeric(12,2),
  contingency_budget numeric(14,2)
);

create table if not exists financing (
  id                   bigserial primary key,
  project_id           bigint      not null references projects(id) on delete cascade,
  participant_id       bigint      references project_participants(id) on delete set null,
  financing_type       text        not null check (financing_type in ('purchase', 'renovation')),
  personal_contribution numeric(14,2) default 0,
  loan_amount          numeric(14,2) not null,
  interest_rate        numeric(6,4)  not null,
  loan_duration        integer       not null,
  bank_fees            numeric(12,2) default 0,
  guarantee_fees       numeric(12,2) default 0,
  loan_deferral_period integer       default 0,
  early_repayment_fee  numeric(6,4)  default 0
);

create table if not exists partner_loans (
  id             bigserial primary key,
  project_id     bigint      not null references projects(id) on delete cascade,
  participant_id bigint      not null references project_participants(id) on delete cascade,
  loan_amount    numeric(14,2) not null,
  interest_rate  numeric(6,4)  not null,
  duration_months integer,
  is_repaid      boolean       not null default false
);

create table if not exists revenues (
  id                   bigserial primary key,
  project_id           bigint      not null references projects(id) on delete cascade,
  revenue_type         text        not null check (revenue_type in ('rental', 'resale')),
  monthly_rent         numeric(12,2),
  resale_price         numeric(14,2),
  other_income         numeric(12,2) default 0,
  rent_indexation_rate numeric(5,4)  default 0,
  ancillary_income     numeric(12,2) default 0
);

create table if not exists expenses (
  id                     bigserial primary key,
  project_id             bigint      not null unique references projects(id) on delete cascade,
  property_tax           numeric(12,2) default 0,
  co_ownership_fees      numeric(12,2) default 0,
  management_fees        numeric(12,2) default 0,
  insurance              numeric(12,2) default 0,
  utilities              numeric(12,2) default 0,
  accounting_fees        numeric(12,2) default 0,
  maintenance_provision  numeric(12,2) default 0,
  charge_indexation_rate numeric(5,4)  default 0
);

create table if not exists future_works (
  id              bigserial primary key,
  project_id      bigint      not null references projects(id) on delete cascade,
  work_type       text        not null,
  estimated_cost  numeric(14,2) not null,
  planned_year    integer      not null,
  frequency_years integer      default 0
);

create table if not exists depreciation (
  id                 bigserial primary key,
  project_id         bigint      not null references projects(id) on delete cascade,
  asset_type         text        not null check (asset_type in ('property', 'renovation', 'furniture')),
  depreciable_value  numeric(14,2) not null,
  depreciation_period integer     not null,
  method             text        not null check (method in ('linear', 'declining')),
  start_date         date        not null
);

create table if not exists results (
  id                     bigserial primary key,
  project_id             bigint      not null references projects(id) on delete cascade,
  year                   integer     not null,
  gross_cashflow         numeric(14,2),
  net_cashflow           numeric(14,2),
  gross_yield            numeric(7,4),
  net_yield              numeric(7,4),
  irr                    numeric(7,4),
  tax_deductible_deficit numeric(14,2),
  details                jsonb,
  unique (project_id, year)
);

create table if not exists participant_results (
  id             bigserial primary key,
  result_id      bigint      not null references results(id) on delete cascade,
  participant_id bigint      not null references project_participants(id) on delete cascade,
  gross_cashflow numeric(14,2),
  net_cashflow   numeric(14,2),
  tax_impact     numeric(14,2)
);

