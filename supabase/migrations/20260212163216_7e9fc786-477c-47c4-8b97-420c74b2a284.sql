
-- Add tags column to backlog_skills
ALTER TABLE public.backlog_skills ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add tags column to entregas_skills
ALTER TABLE public.entregas_skills ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
