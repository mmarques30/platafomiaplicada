
-- Add versao column with default 1
ALTER TABLE public.diagnosticos_skills 
ADD COLUMN IF NOT EXISTS versao integer NOT NULL DEFAULT 1;

-- Drop existing unique constraint (if any)
DO $$
BEGIN
  -- Try common constraint names
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'diagnosticos_skills_user_id_equipe_id_key') THEN
    ALTER TABLE public.diagnosticos_skills DROP CONSTRAINT diagnosticos_skills_user_id_equipe_id_key;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_equipe_diagnostico') THEN
    ALTER TABLE public.diagnosticos_skills DROP CONSTRAINT unique_user_equipe_diagnostico;
  END IF;
END $$;

-- Create new unique constraint with versao
ALTER TABLE public.diagnosticos_skills 
ADD CONSTRAINT diagnosticos_skills_user_equipe_versao_key UNIQUE(user_id, equipe_id, versao);
