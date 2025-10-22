-- Passo 1: Reorganizar ordens das trilhas existentes (empurrar +1 posição)
UPDATE trilhas 
SET ordem = ordem + 1 
WHERE ordem >= 4;

-- Passo 2: Criar Trilha 4: Automação Prática (Sem Código) + 10 Módulos
WITH nova_trilha AS (
  INSERT INTO trilhas (titulo, descricao, nivel, ordem, ativo)
  VALUES (
    'Automação Prática (Sem Código)',
    'NÚCLEO • Intermediário • 2h • 10 módulos • MAIS IMPACTO. 28% querem automatizar - economize 5h/semana. Pré-requisito: Trilha 1. Próximo: Trilha 8 - Zapier (aprofundar)',
    'intermediario',
    4,
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