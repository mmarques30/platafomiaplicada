-- Criar Trilha 6: Análise de Dados com IA (Estatística) + 10 Módulos
WITH nova_trilha AS (
  INSERT INTO trilhas (titulo, descricao, nivel, ordem, ativo)
  VALUES (
    'Análise de Dados com IA (Estatística)',
    'NÚCLEO • Intermediário • 2h • 10 módulos. Análise de dados com IA sem ser expert em estatística. Pré-requisito: Trilha 5 (Claude)',
    'intermediario',
    6,
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
  ('O que automatizar HOJE', 1),
  ('Zapier: Primeira automação', 2),
  ('Automatizar emails', 3),
  ('Forms automáticos', 4),
  ('Notificações inteligentes', 5),
  ('Atualizar CRM sem copiar', 6),
  ('Backup automático', 7),
  ('Consolidar dados', 8),
  ('Detecção de anomalias', 9),
  ('Projeto: Fluxo completo', 10)
) AS modulo(titulo, ordem);