ALTER TABLE public.entregas_business DROP CONSTRAINT IF EXISTS entregas_business_prioridade_check;

UPDATE public.entregas_business 
SET prioridade = 'urgente' 
WHERE prioridade IS NULL OR prioridade NOT IN ('baixa','media','alta','urgente');

ALTER TABLE public.entregas_business ADD CONSTRAINT entregas_business_prioridade_check 
  CHECK (prioridade IN ('baixa','media','alta','urgente'));