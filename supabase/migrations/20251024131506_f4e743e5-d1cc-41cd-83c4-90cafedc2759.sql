-- Reorganizar trilhas: Fundamentos de Automação deve estar na ordem 3

-- Passo 1: Mover temporariamente as trilhas problemáticas para ordens altas (evitar conflitos)
UPDATE trilhas SET ordem = 100 WHERE id = '8118b647-3250-4cc2-b21d-c5f4e570a26d'; -- Atual ordem 4
UPDATE trilhas SET ordem = 101 WHERE id = 'ea256d11-9992-46c6-bb1e-14961b183651'; -- Atual ordem 3

-- Passo 2: Empurrar trilhas >= 4 para frente (+1)
UPDATE trilhas 
SET ordem = ordem + 1 
WHERE ordem >= 4 AND ordem < 100;

-- Passo 3: Colocar "Fundamentos de Automação" na ordem 3
UPDATE trilhas 
SET 
  ordem = 3,
  titulo = 'Fundamentos de Automação',
  descricao = 'BASE ESSENCIAL • NÚCLEO • Iniciante • 1h45min • 10 módulos. 28% querem automatizar - entenda ANTES de fazer. Pré-requisito: Trilha 1. Próximo: Trilha 7 - Zapier (implementar)',
  nivel = 'iniciante'
WHERE id = '8118b647-3250-4cc2-b21d-c5f4e570a26d';

-- Passo 4: Colocar "Análise de Dados com IA (Excel)" na ordem 4
UPDATE trilhas 
SET ordem = 4
WHERE id = 'ea256d11-9992-46c6-bb1e-14961b183651';