## Simulateur immobilier – Spécifications techniques

### 1. Objectif du projet

Simulateur pour **projets immobiliers en France** (achat + travaux, travaux seuls), permettant de calculer :
- rentabilité (rendement brut / net),
- cash-flow brut et net,
- impact fiscal selon le régime (LMNP, location nue, SCI à l’IS),
- indicateurs long terme (TRI).

Le simulateur vise à remplacer/améliorer un tableur Excel existant, avec :
- gestion structurée des données (Supabase / PostgreSQL),
- possibilité de comparer plusieurs scénarios pour un même bien,
- prise en compte fine des charges, taxes, amortissements et financements.

MVP : **un projet unique, un utilisateur unique**, sans authentification.

---

### 2. Régimes fiscaux gérés

- **LMNP (Loueur Meublé Non Professionnel)** – revenus BIC :
  - amortissement du bien (hors terrain) et des meubles,
  - prélèvements sociaux (17,2 %),
  - régime réel (pas de micro-BIC dans un premier temps).

- **Location nue** – revenus fonciers :
  - charges déductibles,
  - **déficit foncier** imputable sur le revenu global (plafond 10 700 €/an),
  - prélèvements sociaux (17,2 %).

- **SCI à l’IS** :
  - imposition à l’IS (taux paramétrable, par défaut 15 % / 25 %),
  - amortissements déductibles,
  - possibilité de **comptes courants d’associés (CCA)** rémunérés (implémentation calculs en phase avancée).

Autres régimes (saisonnier, Pinel, etc.) hors périmètre MVP.

---

### 3. Schéma de données (Supabase / PostgreSQL)

Référence détaillée : conversation Mistral  
`https://chat.mistral.ai/chat/e5cbeee4-be35-4222-a11a-f5eda077e056`

Ce qui suit est la **version de référence** pour les migrations SQL.

#### 3.1. Table `projects`

Rôle : métadonnées générales du projet.

```sql
CREATE TABLE projects (
  id                bigserial PRIMARY KEY,
  name              text        NOT NULL,
  description       text,
  creation_date     date        NOT NULL DEFAULT current_date,
  tax_regime_id     bigint      NOT NULL REFERENCES tax_regimes(id),
  user_id           bigint,
  project_type      text        NOT NULL CHECK (project_type IN ('purchase', 'renovation_only')),
  vacancy_rate      numeric(5,4)   NOT NULL DEFAULT 0.08,   -- 0.08 = 8 %
  inflation_rate    numeric(5,4)   NOT NULL DEFAULT 0.02,   -- 0.02 = 2 %
  sc_formation_cost numeric(12,2)  DEFAULT 0
);
```

#### 3.2. Table `tax_regimes`

Rôle : référentiel des régimes fiscaux.

```sql
CREATE TABLE tax_regimes (
  id                         bigserial PRIMARY KEY,
  name                       text        NOT NULL UNIQUE,   -- 'LMNP', 'NU', 'SCI_IS'
  description                text,
  allows_deficit_deduction   boolean     NOT NULL DEFAULT false,
  tax_rate                   numeric(5,4),                  -- ex: 0.1500, 0.2500
  social_contributions_rate  numeric(5,4) NOT NULL DEFAULT 0.1720
);
```

#### 3.3. Table `project_participants`

Rôle : associés / co-investisseurs pour un projet (utile surtout pour SCI).

```sql
CREATE TABLE project_participants (
  id                  bigserial PRIMARY KEY,
  project_id          bigint      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  participant_name    text        NOT NULL,
  ownership_percentage numeric(6,3) NOT NULL               -- ex: 50.000 pour 50 %
);
```

#### 3.4. Table `property`

Rôle : données d’acquisition (uniquement pour `project_type = 'purchase'`).

```sql
CREATE TABLE property (
  id             bigserial PRIMARY KEY,
  project_id     bigint      NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  purchase_price numeric(14,2) NOT NULL,
  notary_fees    numeric(14,2) NOT NULL,
  acquisition_date date       NOT NULL,
  initial_dpe    text,
  diagnostic_cost numeric(12,2)
);
```

Les travaux et meubles liés à un projet d’achat sont gérés via `renovation_projects` (cf. ci-dessous) en plus de cette table.

#### 3.5. Table `renovation_projects`

Rôle : travaux lourds, que le projet soit un achat + travaux ou des travaux seuls (`renovation_only`).

```sql
CREATE TABLE renovation_projects (
  id                bigserial PRIMARY KEY,
  project_id        bigint      NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  renovation_cost   numeric(14,2) NOT NULL,
  furniture_cost    numeric(14,2),
  permit_required   boolean       NOT NULL DEFAULT false,
  permit_cost       numeric(12,2),
  start_date        date,
  end_date          date,
  target_dpe        text,
  energy_tax_credit numeric(12,2),
  contingency_budget numeric(14,2)   -- marge imprévus, ex: 15 % des travaux
);
```

#### 3.6. Table `financing`

Rôle : financements par projet / participant (prêt achat ou prêt travaux).

```sql
CREATE TABLE financing (
  id                   bigserial PRIMARY KEY,
  project_id           bigint      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  participant_id       bigint      REFERENCES project_participants(id) ON DELETE SET NULL,
  financing_type       text        NOT NULL CHECK (financing_type IN ('purchase', 'renovation')),
  personal_contribution numeric(14,2) DEFAULT 0,
  loan_amount          numeric(14,2) NOT NULL,
  interest_rate        numeric(6,4)  NOT NULL,   -- taux annuel, ex: 0.0300
  loan_duration        integer       NOT NULL,   -- en années
  bank_fees            numeric(12,2) DEFAULT 0,
  guarantee_fees       numeric(12,2) DEFAULT 0,
  loan_deferral_period integer       DEFAULT 0,  -- mois de différé
  early_repayment_fee  numeric(6,4)  DEFAULT 0   -- ex: 0.0100 = 1 %
);
```

#### 3.7. Table `partner_loans`

Rôle : comptes courants d’associés (CCA) – **structure en place pour plus tard**.

```sql
CREATE TABLE partner_loans (
  id             bigserial PRIMARY KEY,
  project_id     bigint      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  participant_id bigint      NOT NULL REFERENCES project_participants(id) ON DELETE CASCADE,
  loan_amount    numeric(14,2) NOT NULL,
  interest_rate  numeric(6,4)  NOT NULL,      -- taux annuel
  duration_months integer,
  is_repaid      boolean       NOT NULL DEFAULT false
);
```

#### 3.8. Table `revenues`

Rôle : revenus liés au projet (loyers et/ou revente).

```sql
CREATE TABLE revenues (
  id                   bigserial PRIMARY KEY,
  project_id           bigint      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  revenue_type         text        NOT NULL CHECK (revenue_type IN ('rental', 'resale')),
  monthly_rent         numeric(12,2),         -- uniquement si rental
  resale_price         numeric(14,2),         -- uniquement si resale
  other_income         numeric(12,2) DEFAULT 0,
  rent_indexation_rate numeric(5,4)  DEFAULT 0,    -- ex: 0.0200
  ancillary_income     numeric(12,2) DEFAULT 0
);
```

#### 3.9. Table `expenses`

Rôle : charges récurrentes associées au projet.

```sql
CREATE TABLE expenses (
  id                     bigserial PRIMARY KEY,
  project_id             bigint      NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  property_tax           numeric(12,2) DEFAULT 0,
  co_ownership_fees      numeric(12,2) DEFAULT 0,
  management_fees        numeric(12,2) DEFAULT 0,
  insurance              numeric(12,2) DEFAULT 0,
  utilities              numeric(12,2) DEFAULT 0,
  accounting_fees        numeric(12,2) DEFAULT 0,
  maintenance_provision  numeric(12,2) DEFAULT 0,
  charge_indexation_rate numeric(5,4)  DEFAULT 0
);
```

#### 3.10. Table `future_works`

Rôle : travaux anticipés sur l’horizon de détention.

```sql
CREATE TABLE future_works (
  id              bigserial PRIMARY KEY,
  project_id      bigint      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_type       text        NOT NULL,       -- ex: 'roof', 'boiler'
  estimated_cost  numeric(14,2) NOT NULL,
  planned_year    integer      NOT NULL,      -- année relative ou absolue selon logique
  frequency_years integer      DEFAULT 0      -- 0 = one-shot, sinon périodique
);
```

#### 3.11. Table `depreciation`

Rôle : paramètres d’amortissement (bien, travaux, meubles).

```sql
CREATE TABLE depreciation (
  id                 bigserial PRIMARY KEY,
  project_id         bigint      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_type         text        NOT NULL CHECK (asset_type IN ('property', 'renovation', 'furniture')),
  depreciable_value  numeric(14,2) NOT NULL,
  depreciation_period integer     NOT NULL,   -- années
  method             text        NOT NULL CHECK (method IN ('linear', 'declining')),
  start_date         date        NOT NULL
);
```

#### 3.12. Table `results`

Rôle : résultats annuels agrégés du projet.

```sql
CREATE TABLE results (
  id                     bigserial PRIMARY KEY,
  project_id             bigint      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  year                   integer     NOT NULL,
  gross_cashflow         numeric(14,2),
  net_cashflow           numeric(14,2),
  gross_yield            numeric(7,4),
  net_yield              numeric(7,4),
  irr                    numeric(7,4),
  tax_deductible_deficit numeric(14,2),
  details                jsonb,
  UNIQUE (project_id, year)
);
```

#### 3.13. Table `participant_results`

Rôle : résultats annuels par participant (SCI).

```sql
CREATE TABLE participant_results (
  id             bigserial PRIMARY KEY,
  result_id      bigint      NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  participant_id bigint      NOT NULL REFERENCES project_participants(id) ON DELETE CASCADE,
  gross_cashflow numeric(14,2),
  net_cashflow   numeric(14,2),
  tax_impact     numeric(14,2)
);
```

---

### 4. Formules clés (métier)

#### 4.1. Mensualité et coût total du prêt

Soit :
- \( L \) : `loan_amount`,
- \( r \) : taux mensuel = `interest_rate` / 12,
- \( n \) : nombre de mois = `loan_duration` × 12,
- \( d \) : `loan_deferral_period` (mois de différé).

Mensualité (hors différé) :
\[
M = \frac{L \cdot r}{1 - (1 + r)^{-n}}
\]

Coût total des intérêts (sans différé) :
\[
I_{total} = M \cdot n - L
\]

En cas de **différé** :
- pendant \( d \) mois : paiement des intérêts seuls \( L \cdot r \) (optionnel selon le produit bancaire),
- puis mensualités classiques \( M \) sur \( n \) mois.

#### 4.2. Revenus annuels locatifs

À partir de `revenues` et de `projects.vacancy_rate` :

\[
L_{annuel} = \text{monthly\_rent} \times 12 \times (1 - \text{vacancy\_rate})
\]

Revenus annexes :
\[
R_{autres} = \text{other\_income} + \text{ancillary\_income}
\]

Total revenus annuels :
\[
R_{total} = L_{annuel} + R_{autres}
\]

#### 4.3. Charges annuelles

À partir de `expenses` et des travaux futurs (`future_works`) lissés sur la durée :

\[
C_{fixes} = \text{property\_tax} + \text{co\_ownership\_fees} + \text{management\_fees} +
\text{insurance} + \text{utilities} + \text{accounting\_fees} + \text{maintenance\_provision}
\]

Pour les travaux futurs, on calcule au minimum un **budget moyen annuel** :
\[
C_{travaux\_moyen} = \frac{\sum \text{estimated\_cost}}{\text{horizon\_années}}
\]

Charges annuelles totales (simplifiées) :
\[
C_{annuelles} = C_{fixes} + C_{travaux\_moyen}
\]

#### 4.4. Amortissements (LMNP / SCI à l’IS)

Pour chaque ligne `depreciation` :

\[
Amortissement\_annuel = \frac{\text{depreciable\_value}}{\text{depreciation\_period}}
\]

Total amortissements annuels :
\[
Amort_{annuel} = \sum Amortissement\_annuel
\]

#### 4.5. Cash-flow et résultat avant impôt

Revenus annuels : \( R_{total} \)  
Charges annuelles : \( C_{annuelles} \)  
Mensualités annuelles de prêt (hors différé) : \( M \times 12 \)

Résultat avant impôt (hors amortissements) :
\[
Résultat\_{avant\_impôt\_hors\_amort} = R_{total} - C_{annuelles} - M \cdot 12
\]

Résultat imposable (en fonction du régime) :
- **LMNP / SCI à l’IS** (amortissements déductibles) :
\[
Résultat\_{imposable} = Résultat\_{avant\_impôt\_hors\_amort} - Amort_{annuel}
\]
- **Location nue** (pas d’amortissement) :
\[
Résultat\_{imposable} = Résultat\_{avant\_impôt\_hors\_amort}
\]

#### 4.6. Fiscalité

- **Prélèvements sociaux** (LMNP, location nue) :
\[
PS = \max(0, Résultat\_{imposable}) \times 0{,}172
\]

- **IS (SCI à l’IS)** :
  - tranche basse (ex: 15 %) jusqu’à un certain seuil,
  - puis tranche haute (ex: 25 %) pour le surplus.  
La formule exacte sera paramétrée via `tax_regimes.tax_rate` et/ou une logique interne.

- **Déficit foncier (location nue)** :
  - si \( Résultat\_{imposable} < 0 \), déficit imputable sur revenu global dans la limite de 10 700 €/an,
  - la part excédentaire est reportable.

#### 4.7. Cash-flow net

Cash-flow brut :
\[
CF_{brut} = R_{total} - C_{annuelles} - M \cdot 12
\]

Impôt total (IR / IS + prélèvements sociaux) : \( Impôt_{total} \)

Cash-flow net :
\[
CF_{net} = CF_{brut} - Impôt_{total}
\]

#### 4.8. Rendement et TRI

- **Rendement brut** :
\[
R_{brut} = \frac{L_{annuel}}{Coût\_{total\_investi}} \times 100
\]

- **Rendement net** :
\[
R_{net} = \frac{CF_{net}}{Coût\_{total\_investi}} \times 100
\]

- **TRI (IRR)** :  
Calculé sur un vecteur de flux \([CF_0, CF_1, \dots, CF_n]\) via une méthode numérique (ex: Newton, ou une librairie JS type `irr`).

---

### 5. Architecture d’implémentation (haut niveau)

- **Base de données** : Supabase (PostgreSQL) avec le schéma ci-dessus.
- **Backend / logique métier** :
  - Fonctions TypeScript dans `src/lib/calculations` (prêt, cash-flow, amortissements, fiscalité par régime, TRI).
  - Utilisation de `@supabase/supabase-js` pour lire / écrire les données (projet unique dans le MVP).
- **Frontend** (SvelteKit) :
  - Page unique (MVP) permettant de :
    - saisir / éditer les données du projet (project, property/renovation, financing, revenues, expenses, future_works, depreciation),
    - lancer les calculs via les fonctions métier,
    - afficher les résultats (tableaux + graphiques).

Tests :
- tests unitaires sur les fonctions de calcul (Vitest).

Cette spécification est la référence pour :
- les migrations SQL Supabase,
- la définition des types TypeScript,
- l’implémentation des calculs,
- la structure des formulaires et des écrans.

