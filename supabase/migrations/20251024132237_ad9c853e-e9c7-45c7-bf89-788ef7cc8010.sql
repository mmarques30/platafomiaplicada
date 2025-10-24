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

-- ETAPA 2: Criar nova trilha "Planilhas & Dados com IA"

-- 2.1. Inserir nova trilha na ordem 2
INSERT INTO trilhas (titulo, descricao, nivel, ordem, ativo)
VALUES (
  'Planilhas & Dados com IA',
  'Aprenda a transformar planilhas caóticas em insights valiosos usando IA. Da limpeza de dados à criação de relatórios automáticos, domine o uso de IA para análise de dados com 40% de demanda - PRIORIDADE MÁXIMA.',
  'iniciante',
  2,
  true
);

-- 2.2. Ajustar ordem das outras trilhas (incrementar 1 nas que são >= 2, exceto a nova)
UPDATE trilhas 
SET ordem = ordem + 1 
WHERE ordem >= 2 AND titulo != 'Planilhas & Dados com IA';

-- ETAPA 3: Criar os 10 módulos da nova trilha

INSERT INTO modulos (trilha_id, titulo, descricao, ordem, categoria, ativo)
VALUES
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Por que planilhas são um caos',
   'Entenda os principais problemas que tornam planilhas confusas e como a IA pode ajudar a organizá-las.',
   1,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Claude lê e entende sua planilha',
   'Aprenda a usar o Claude para analisar e interpretar dados de planilhas automaticamente.',
   2,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Limpar dados bagunçados',
   'Técnicas para identificar e corrigir dados inconsistentes, duplicados e mal formatados com IA.',
   3,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Gerar fórmulas complexas',
   'Use IA para criar fórmulas avançadas do Excel/Google Sheets sem precisar decorar sintaxe.',
   4,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Análise exploratória rápida',
   'Descubra padrões, tendências e insights em seus dados de forma rápida usando IA.',
   5,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Cruzar múltiplas planilhas',
   'Aprenda a combinar e relacionar dados de diferentes fontes com ajuda da IA.',
   6,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Identificar padrões e outliers',
   'Use IA para detectar anomalias, valores extremos e padrões escondidos nos dados.',
   7,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Gráficos que contam história',
   'Crie visualizações impactantes que comunicam insights de forma clara e persuasiva.',
   8,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Relatório automático de planilha',
   'Automatize a geração de relatórios completos a partir de dados de planilhas.',
   9,
   'gravacao_videos',
   true),
  
  ((SELECT id FROM trilhas WHERE titulo = 'Planilhas & Dados com IA'),
   'Projeto: De caos a insights',
   'Projeto prático final: transforme uma planilha real caótica em um relatório com insights acionáveis.',
   10,
   'gravacao_videos',
   true);