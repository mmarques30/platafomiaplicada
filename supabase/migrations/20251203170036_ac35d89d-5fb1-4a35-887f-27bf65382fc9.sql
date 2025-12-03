-- Adicionar campo para link de documento na tabela metodos_aplicar
ALTER TABLE public.metodos_aplicar 
ADD COLUMN IF NOT EXISTS link_documento TEXT;