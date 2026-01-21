-- Renomear coluna e alterar tipo para suportar múltiplos arquivos
ALTER TABLE public.materiais_comunidade 
RENAME COLUMN arquivo_url TO arquivos_url;

ALTER TABLE public.materiais_comunidade 
ALTER COLUMN arquivos_url TYPE jsonb USING 
  CASE 
    WHEN arquivos_url IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(arquivos_url)
  END;

ALTER TABLE public.materiais_comunidade 
ALTER COLUMN arquivos_url SET DEFAULT '[]'::jsonb;