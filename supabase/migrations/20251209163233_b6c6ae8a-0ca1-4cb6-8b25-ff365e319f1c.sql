-- Remover constraint existente
ALTER TABLE materiais_gratuitos 
DROP CONSTRAINT IF EXISTS materiais_gratuitos_categoria_check;

-- Recriar constraint com nova categoria incluída
ALTER TABLE materiais_gratuitos 
ADD CONSTRAINT materiais_gratuitos_categoria_check 
CHECK (categoria = ANY (ARRAY[
  'templates'::text, 
  'guias'::text, 
  'prompts'::text, 
  'ferramentas'::text, 
  'checklists'::text, 
  'ebooks'::text, 
  'newsletter'::text,
  'materiais_aula'::text
]));