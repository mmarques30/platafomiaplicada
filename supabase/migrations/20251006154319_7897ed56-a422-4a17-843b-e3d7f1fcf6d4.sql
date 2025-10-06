-- Adicionar coluna trilha_id na tabela videos
ALTER TABLE public.videos
ADD COLUMN trilha_id uuid REFERENCES public.trilhas(id) ON DELETE CASCADE;

-- Copiar dados: videos.modulo_id -> cursos.trilha_id -> videos.trilha_id
UPDATE public.videos v
SET trilha_id = c.trilha_id
FROM public.modulos m
JOIN public.cursos c ON m.curso_id = c.id
WHERE v.modulo_id = m.id;

-- Remover constraint antigo de modulo_id (não deletar coluna ainda para preservar dados)
-- ALTER TABLE public.videos DROP COLUMN modulo_id;

-- Adicionar índice para melhor performance
CREATE INDEX idx_videos_trilha_id ON public.videos(trilha_id);

-- Comentar as tabelas antigas (deprecadas)
COMMENT ON TABLE public.cursos IS 'DEPRECATED: Não usar mais. Videos agora se relacionam diretamente com trilhas.';
COMMENT ON TABLE public.modulos IS 'DEPRECATED: Não usar mais. Videos agora se relacionam diretamente com trilhas.';