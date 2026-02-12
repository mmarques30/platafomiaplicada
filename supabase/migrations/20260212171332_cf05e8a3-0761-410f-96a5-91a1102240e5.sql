ALTER TABLE public.entregas_equipe_skills
ADD CONSTRAINT entregas_equipe_skills_responsavel_id_fkey
FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;