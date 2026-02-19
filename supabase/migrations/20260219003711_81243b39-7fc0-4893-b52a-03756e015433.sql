ALTER TABLE public.backlog_skills 
  ADD COLUMN tempo_atual_horas numeric,
  ADD COLUMN cargo_executor text,
  ADD COLUMN custo_hora_executor numeric;