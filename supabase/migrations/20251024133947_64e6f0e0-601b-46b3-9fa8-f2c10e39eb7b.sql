-- Criar trilha "Make do Zero ao Avançado" como ordem 10
INSERT INTO trilhas (titulo, descricao, nivel, ordem, ativo)
VALUES (
  'Make do Zero ao Avançado',
  'Workflows complexos com lógica visual poderosa',
  'avancado',
  10,
  true
);

-- Inserir os 10 módulos da trilha Make
WITH nova_trilha AS (
  SELECT id FROM trilhas WHERE titulo = 'Make do Zero ao Avançado' AND ordem = 10 LIMIT 1
)
INSERT INTO modulos (trilha_id, titulo, descricao, ordem, categoria, ativo)
SELECT 
  nova_trilha.id,
  m.titulo,
  m.descricao,
  m.ordem,
  m.categoria,
  m.ativo
FROM nova_trilha
CROSS JOIN (
  VALUES
    ('Make vs Zapier: Quando migrar', 'Entenda as diferenças entre Make e Zapier e quando vale a pena fazer a migração.', 1, 'gravacao_videos', true),
    ('Interface visual: Scenarios e módulos', 'Aprenda a navegar pela interface do Make e entender a estrutura de scenarios e módulos.', 2, 'gravacao_videos', true),
    ('Primeiro Scenario funcional', 'Crie seu primeiro workflow funcional no Make do zero.', 3, 'gravacao_videos', true),
    ('Routers: Lógica complexa ramificada', 'Domine o uso de routers para criar fluxos com múltiplos caminhos condicionais.', 4, 'gravacao_videos', true),
    ('Iterators: Processar arrays e lotes', 'Aprenda a processar listas de dados e iterar sobre múltiplos itens.', 5, 'gravacao_videos', true),
    ('Aggregators: Consolidar dados', 'Use aggregators para combinar e consolidar informações de múltiplas fontes.', 6, 'gravacao_videos', true),
    ('Data Stores: Banco de dados simples', 'Crie bancos de dados simples dentro do Make para armazenar informações temporárias.', 7, 'gravacao_videos', true),
    ('HTTP/API: Integrar qualquer coisa', 'Conecte o Make com qualquer serviço através de chamadas HTTP e APIs.', 8, 'gravacao_videos', true),
    ('Webhooks e scheduling avançado', 'Configure webhooks e agendamentos complexos para automações sofisticadas.', 9, 'gravacao_videos', true),
    ('Projeto: Pipeline dados → IA → dashboard', 'Projeto final: crie um pipeline completo que captura dados, processa com IA e exibe em dashboard.', 10, 'gravacao_videos', true)
) AS m(titulo, descricao, ordem, categoria, ativo);