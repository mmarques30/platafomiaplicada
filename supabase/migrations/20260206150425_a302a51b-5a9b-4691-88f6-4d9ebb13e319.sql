-- Remover tabelas duplicadas *_squad que conflitam com *_skills
DROP TABLE IF EXISTS public.entregas_squad CASCADE;
DROP TABLE IF EXISTS public.metricas_squad CASCADE;
DROP TABLE IF EXISTS public.roadmap_squad CASCADE;
DROP TABLE IF EXISTS public.membros_squad CASCADE;
DROP TABLE IF EXISTS public.squads CASCADE;