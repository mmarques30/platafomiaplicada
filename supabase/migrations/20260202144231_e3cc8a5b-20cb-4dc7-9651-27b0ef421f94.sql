-- Adicionar colunas para suportar conteúdos de criadores na Central
ALTER TABLE public.conteudos_dashboard 
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT NULL;

ALTER TABLE public.conteudos_dashboard 
ADD COLUMN IF NOT EXISTS criador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.conteudos_dashboard 
ADD COLUMN IF NOT EXISTS arquivos_url JSONB DEFAULT '[]'::jsonb;

-- Comentário explicando os campos
COMMENT ON COLUMN public.conteudos_dashboard.categoria IS 'Categoria do conteúdo (ChatGPT, Claude, Midjourney, etc.) - usado quando tipo = criador';
COMMENT ON COLUMN public.conteudos_dashboard.criador_id IS 'ID do perfil do criador do conteúdo';
COMMENT ON COLUMN public.conteudos_dashboard.arquivos_url IS 'Array de URLs de arquivos anexados ao conteúdo';