-- Seed initial tax_regimes

insert into tax_regimes (name, description, allows_deficit_deduction, tax_rate, social_contributions_rate)
values
  ('LMNP', 'Loueur Meublé Non Professionnel (BIC réel, amortissements)', false, null, 0.1720),
  ('NU', 'Location nue (revenus fonciers, déficit foncier imputable)', true, null, 0.1720),
  ('SCI_IS', 'SCI soumise à l’Impôt sur les Sociétés', false, 0.2500, 0.0000)
on conflict (name) do nothing;

