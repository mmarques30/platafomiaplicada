-- Atualizar CHECK constraint para incluir categoria 'newsletter'
ALTER TABLE public.materiais_gratuitos 
DROP CONSTRAINT IF EXISTS materiais_gratuitos_categoria_check;

ALTER TABLE public.materiais_gratuitos 
ADD CONSTRAINT materiais_gratuitos_categoria_check 
CHECK (categoria IN ('templates', 'guias', 'prompts', 'ferramentas', 'checklists', 'ebooks', 'newsletter'));