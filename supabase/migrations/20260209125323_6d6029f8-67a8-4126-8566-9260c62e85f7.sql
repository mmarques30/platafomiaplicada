
ALTER TABLE public.entregas_skills 
  ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS prioridade text DEFAULT 'P3',
  ADD COLUMN IF NOT EXISTS processos_resolvidos integer DEFAULT 0;
