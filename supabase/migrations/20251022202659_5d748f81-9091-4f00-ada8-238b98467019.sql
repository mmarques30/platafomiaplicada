-- 1. Atualizar trilha para nível avancado (sem cedilha)
UPDATE trilhas
SET 
  nivel = 'avancado',
  descricao = 'NÚCLEO • Avançado • 2h15min • 10 módulos. Dados → insights → decisões. Pré-requisitos: Trilha 2 + Trilha 5. Próximo: Trilha 8: Make ou profissão',
  updated_at = NOW()
WHERE id = 'ea256d11-9992-46c6-bb1e-14961b183651';

-- 2. Deletar módulos antigos
DELETE FROM modulos 
WHERE trilha_id = 'ea256d11-9992-46c6-bb1e-14961b183651';

-- 3. Inserir novos módulos
INSERT INTO modulos (trilha_id, titulo, ordem, categoria, ativo)
VALUES
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Claude para análise exploratória', 1, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Limpeza de dados', 2, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Estatística descritiva', 3, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Padrões e anomalias', 4, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Looker Studio: Primeiro dashboard', 5, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'KPIs que contam história', 6, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Dashboards interativos', 7, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Relatórios agendados', 8, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Integração Make + IA + Looker', 9, 'outro', true),
  ('ea256d11-9992-46c6-bb1e-14961b183651', 'Projeto: Sistema BI automático', 10, 'outro', true);