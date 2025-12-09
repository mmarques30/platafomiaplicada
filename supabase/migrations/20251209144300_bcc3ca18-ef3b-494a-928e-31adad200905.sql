-- Adicionar campo tipo_evento na tabela aulas_semanais
ALTER TABLE public.aulas_semanais 
ADD COLUMN IF NOT EXISTS tipo_evento TEXT DEFAULT 'aula_ao_vivo';

COMMENT ON COLUMN public.aulas_semanais.tipo_evento IS 'Tipo do evento: aula_ao_vivo, qa, outro';