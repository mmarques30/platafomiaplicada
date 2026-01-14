-- Adicionar coluna ferramentas_projeto à tabela projetos_mentoria
ALTER TABLE public.projetos_mentoria 
ADD COLUMN IF NOT EXISTS ferramentas_projeto jsonb DEFAULT '[]'::jsonb;