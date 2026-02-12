ALTER TABLE public.entregas_equipe_skills 
ADD COLUMN projeto_id UUID REFERENCES public.backlog_skills(id) ON DELETE SET NULL;