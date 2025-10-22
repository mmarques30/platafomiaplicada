-- Criar trilha "Automação Avançada (Make)" e seus 10 módulos
WITH nova_trilha AS (
  INSERT INTO trilhas (titulo, descricao, nivel, ordem, ativo)
  VALUES (
    'Automação Avançada (Make)',
    'FERRAMENTAS • Avançado • 2h30min • 10 módulos. Workflows complexos com lógica visual. Pré-requisitos: Trilha 7. Próximo: Trilha 6 (integração) ou profissão',
    'avancado',
    8,
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
  ('Make vs Zapier', 1),
  ('Interface visual: Scenarios', 2),
  ('Primeiro Scenario', 3),
  ('Routers: Lógica complexa', 4),
  ('Iterators: Processar lotes', 5),
  ('Data Stores', 6),
  ('HTTP/API', 7),
  ('Webhooks', 8),
  ('Error handling', 9),
  ('Projeto: Sistema end-to-end', 10)
) AS modulo(titulo, ordem);