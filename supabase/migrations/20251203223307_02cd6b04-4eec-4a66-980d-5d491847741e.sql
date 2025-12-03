-- Adicionar campo comentarios à tabela metodos_aplicar
ALTER TABLE public.metodos_aplicar 
ADD COLUMN comentarios TEXT;

-- Tornar template opcional (remover NOT NULL se existir)
ALTER TABLE public.metodos_aplicar 
ALTER COLUMN template DROP NOT NULL;