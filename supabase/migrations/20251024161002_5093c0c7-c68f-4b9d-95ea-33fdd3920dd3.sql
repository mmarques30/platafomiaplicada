-- Remove CHECK constraints que limitam as categorias a valores fixos
ALTER TABLE public.trilhas 
DROP CONSTRAINT IF EXISTS trilhas_categoria_check;

ALTER TABLE public.modulos 
DROP CONSTRAINT IF EXISTS modulos_categoria_check;

-- As colunas categoria continuam NOT NULL mas agora aceitam qualquer texto