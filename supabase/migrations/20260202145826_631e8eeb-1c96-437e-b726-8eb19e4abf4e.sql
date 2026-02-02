-- Remover constraint antiga
ALTER TABLE public.conteudos_dashboard DROP CONSTRAINT conteudos_dashboard_tipo_check;

-- Adicionar nova constraint com todos os tipos
ALTER TABLE public.conteudos_dashboard ADD CONSTRAINT conteudos_dashboard_tipo_check 
CHECK (tipo = ANY (ARRAY['newsletter', 'noticia', 'dica', 'material', 'criador']));