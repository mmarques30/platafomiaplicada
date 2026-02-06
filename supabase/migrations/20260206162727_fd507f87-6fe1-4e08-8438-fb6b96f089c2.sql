-- Adicionar campo ROI na tabela entregas_skills
ALTER TABLE public.entregas_skills ADD COLUMN IF NOT EXISTS roi numeric DEFAULT 0;

-- Adicionar campos ROI projetado e executado na tabela metricas_skills
ALTER TABLE public.metricas_skills ADD COLUMN IF NOT EXISTS roi_projetado numeric DEFAULT 0;
ALTER TABLE public.metricas_skills ADD COLUMN IF NOT EXISTS roi_executado numeric DEFAULT 0;

-- Adicionar semana atual na tabela equipes_skills
ALTER TABLE public.equipes_skills ADD COLUMN IF NOT EXISTS semana_atual integer DEFAULT 1;