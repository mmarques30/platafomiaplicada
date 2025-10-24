-- Adicionar campos ordem e nivel_complexidade à tabela biblioteca_prompts
ALTER TABLE biblioteca_prompts 
ADD COLUMN ordem INTEGER,
ADD COLUMN nivel_complexidade TEXT 
  CHECK (nivel_complexidade IN ('iniciante', 'intermediario', 'avancado'));

-- Atualizar os 7 prompts existentes com ordem e nível
UPDATE biblioteca_prompts SET ordem = 1, nivel_complexidade = 'iniciante' 
WHERE titulo = 'Email Profissional Express';

UPDATE biblioteca_prompts SET ordem = 2, nivel_complexidade = 'iniciante' 
WHERE titulo = 'Ata de Reunião Instantânea';

UPDATE biblioteca_prompts SET ordem = 3, nivel_complexidade = 'intermediario' 
WHERE titulo = 'Resumo de Documento Longo Inteligente';

UPDATE biblioteca_prompts SET ordem = 4, nivel_complexidade = 'intermediario' 
WHERE titulo = 'Simplificador de Texto Técnico';

UPDATE biblioteca_prompts SET ordem = 5, nivel_complexidade = 'intermediario' 
WHERE titulo = 'Relatório Executivo Automático';

UPDATE biblioteca_prompts SET ordem = 6, nivel_complexidade = 'avancado' 
WHERE titulo = 'Feedback Construtivo (Método SBI)';

UPDATE biblioteca_prompts SET ordem = 7, nivel_complexidade = 'avancado' 
WHERE titulo = 'Proposta Comercial Estruturada';

-- Criar índice para performance em ordenação
CREATE INDEX idx_biblioteca_prompts_ordem ON biblioteca_prompts(ordem);

-- Comentários explicativos
COMMENT ON COLUMN biblioteca_prompts.ordem IS 'Define a sequência pedagógica de apresentação dos prompts';
COMMENT ON COLUMN biblioteca_prompts.nivel_complexidade IS 'Nível de complexidade: iniciante, intermediario ou avancado';