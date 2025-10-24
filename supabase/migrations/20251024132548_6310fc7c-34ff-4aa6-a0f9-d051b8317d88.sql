-- ETAPA 1: Excluir trilha antiga e seus módulos

-- 1.1. Excluir módulos da trilha "Análise de Dados com IA (Excel)"
DELETE FROM modulos 
WHERE trilha_id = 'ea256d11-9992-46c6-bb1e-14961b183651';

-- 1.2. Excluir a trilha antiga
DELETE FROM trilhas 
WHERE id = 'ea256d11-9992-46c6-bb1e-14961b183651';

-- 1.3. Reorganizar ordens das trilhas seguintes (diminuir 1)
UPDATE trilhas 
SET ordem = ordem - 1 
WHERE ordem >= 5;

-- ETAPA 2: Ajustar ordens para abrir espaço na posição 2
UPDATE trilhas 
SET ordem = ordem + 1 
WHERE ordem >= 2;

-- ETAPA 3: Criar nova trilha "Planilhas & Dados com IA"
INSERT INTO trilhas (titulo, descricao, nivel, ordem, ativo)
VALUES (
  'Planilhas & Dados com IA',
  'Aprenda a transformar planilhas caóticas em insights valiosos usando IA. Da limpeza de dados à criação de relatórios automáticos, domine o uso de IA para análise de dados com 40% de demanda - PRIORIDADE MÁXIMA.',
  'iniciante',
  2,
  true
);

-- ETAPA 4: Criar os 10 módulos da nova trilha usando CTE
WITH nova_trilha AS (
  SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA' AND ordem = 2 LIMIT 1
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
    ('Por que planilhas são um caos', 'Entenda os principais problemas que tornam planilhas confusas e como a IA pode ajudar a organizá-las.', 1, 'gravacao_videos', true),
    ('Claude lê e entende sua planilha', 'Aprenda a usar o Claude para analisar e interpretar dados de planilhas automaticamente.', 2, 'gravacao_videos', true),
    ('Limpar dados bagunçados', 'Técnicas para identificar e corrigir dados inconsistentes, duplicados e mal formatados com IA.', 3, 'gravacao_videos', true),
    ('Gerar fórmulas complexas', 'Use IA para criar fórmulas avançadas do Excel/Google Sheets sem precisar decorar sintaxe.', 4, 'gravacao_videos', true),
    ('Análise exploratória rápida', 'Descubra padrões, tendências e insights em seus dados de forma rápida usando IA.', 5, 'gravacao_videos', true),
    ('Cruzar múltiplas planilhas', 'Aprenda a combinar e relacionar dados de diferentes fontes com ajuda da IA.', 6, 'gravacao_videos', true),
    ('Identificar padrões e outliers', 'Use IA para detectar anomalias, valores extremos e padrões escondidos nos dados.', 7, 'gravacao_videos', true),
    ('Gráficos que contam história', 'Crie visualizações impactantes que comunicam insights de forma clara e persuasiva.', 8, 'gravacao_videos', true),
    ('Relatório automático de planilha', 'Automatize a geração de relatórios completos a partir de dados de planilhas.', 9, 'gravacao_videos', true),
    ('Projeto: De caos a insights', 'Projeto prático final: transforme uma planilha real caótica em um relatório com insights acionáveis.', 10, 'gravacao_videos', true)
) AS m(titulo, descricao, ordem, categoria, ativo);