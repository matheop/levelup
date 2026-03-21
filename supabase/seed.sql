-- Seed initial tax_regimes

insert into tax_regimes (name, description, allows_deficit_deduction, tax_rate, social_contributions_rate)
values
  ('LMNP', 'Loueur Meuble Non Professionnel', false, null, 0.1860),
  ('NU', 'Location nue', true, null, 0.1860),
  ('SCI_IS', 'SCI soumise a l''IS', false, 0.2500, 0.0000)
on conflict (name) do nothing;

