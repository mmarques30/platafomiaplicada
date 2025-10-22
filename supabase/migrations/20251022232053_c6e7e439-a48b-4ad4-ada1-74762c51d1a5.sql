-- Criar Trilha 7: Automação Rápida (Zapier) + 10 Módulos
WITH nova_trilha AS (
  INSERT INTO trilhas (titulo, descricao, nivel, ordem, ativo)
  VALUES (
    'Automação Rápida (Zapier)',
    'FERRAMENTAS • Intermediário • 2h15min • 10 módulos. Quick wins com apps populares sem código. Pré-requisito: Trilha 3. Próximo: Trilha 8 - Make (se precisar complexidade)',
    'intermediario',
    7,
    true
  )
  RETURNING id
)
INSERT INTO modulos (trilha_id, titulo, ordem, categoria, ativo)
SELECT 
  nova_trilha.id,
  modulo.titulo,
  modulo.ordem,
  'outro'::text,
  true
FROM nova_trilha,
(VALUES
  ('Zapier: Quando usar', 1),
  ('Primeiro Zap em 5min', 2),
  ('Zaps essenciais', 3),
  ('ChatGPT no Zapier', 4),
  ('Multi-step', 5),
  ('Filters e Paths', 6),
  ('Formatação de dados', 7),
  ('Tratamento de erros', 8),
  ('Otimizar tasks', 9),
  ('Projeto: Assistente email + CRM', 10)
) AS modulo(titulo, ordem);