
-- Add optional entrega_skills_id column for linking subtasks to AI entregas
ALTER TABLE public.subtarefas_entregas_skills 
  ALTER COLUMN entrega_equipe_id DROP NOT NULL;

ALTER TABLE public.subtarefas_entregas_skills 
  ADD COLUMN entrega_skills_id UUID REFERENCES public.entregas_skills(id) ON DELETE CASCADE;

-- Add check constraint: at least one of the two FK columns must be set
ALTER TABLE public.subtarefas_entregas_skills
  ADD CONSTRAINT chk_subtarefa_parent 
  CHECK (entrega_equipe_id IS NOT NULL OR entrega_skills_id IS NOT NULL);

-- Index for efficient lookups
CREATE INDEX idx_subtarefas_entrega_skills_id ON public.subtarefas_entregas_skills(entrega_skills_id) WHERE entrega_skills_id IS NOT NULL;
