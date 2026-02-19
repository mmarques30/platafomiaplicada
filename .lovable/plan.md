
# Ajustes no Sistema de Conteudos

## Resumo
Reordenar trilhas conforme documento, criar a trilha "IA para RH e Pessoas" (que nao existe no banco), adicionar campo de cohost nas trilhas, e atualizar o frontend para suportar essa nova informacao.

## O que muda

### 1. Migracao no banco de dados
- Adicionar coluna `cohost_nome` (text, nullable) na tabela `trilhas` para registrar o responsavel/cohost de cada trilha
- Reordenar todas as trilhas para corresponder ao documento:
  - Como Usar a Plataforma: ordem 0
  - Fundamentos de IA: ordem 1
  - Planilhas Limpeza: ordem 2
  - Planilhas Analise: ordem 3
  - Fundamentos Automacao: ordem 4
  - Comunicacao com IA: ordem 5
  - Claude Avancado: ordem 6
  - Dashboard e BI: ordem 7
  - Manus: ordem 8
  - Zapier: ordem 9
  - Make: ordem 10
  - Apresentacoes (Gamma): ordem 11
  - Apps Web sem Codigo: ordem 12
  - IA para Carreira e Lideranca: ordem 13
  - IA para Recolocacao: ordem 14
  - IA para Vendas: ordem 15
  - IA para Marketing: ordem 16
  - IA para RH e Pessoas: ordem 17 (NOVA)
  - IA para Gestao de Projetos: ordem 18
  - IA para Financas: ordem 19
  - Gravacoes Aulas Semanais: ordem 20 (mantida separada no final)
- Criar trilha "IA para RH e Pessoas" com nivel "aplicado", categoria "profissao"
- Criar os 11 modulos dessa nova trilha (Case Real + modulos 1-10 conforme documento)

### 2. Trilhas com videos (nao serao alteradas)
As seguintes trilhas ja possuem videos gravados e nao terao seus modulos modificados:
- Como Usar a Plataforma IAplicada (4 videos)
- Gravacoes Aulas Semanais (22 videos)
- Fundamentos de IA (11 videos)

### 3. Frontend - TrilhaModal
- Adicionar campo "Cohost / Responsavel" (input de texto) no formulario de criacao/edicao de trilha
- Campo opcional, para registrar quem vai gravar alem de voce

### 4. Frontend - TrilhasTab
- Adicionar coluna "Cohost" na tabela de listagem de trilhas

## Detalhes tecnicos

### Migracao SQL
```sql
-- 1. Adicionar coluna cohost
ALTER TABLE trilhas ADD COLUMN cohost_nome TEXT;

-- 2. Reordenar trilhas
UPDATE trilhas SET ordem = 0 WHERE id = '8320baf4-...'; -- Como Usar
UPDATE trilhas SET ordem = 1 WHERE id = '83df428c-...'; -- Fundamentos IA
-- ... (todas as 20 trilhas)

-- 3. Criar trilha RH e Pessoas + 11 modulos
INSERT INTO trilhas (...) VALUES (...);
INSERT INTO modulos (...) VALUES (...); -- 11 modulos
```

### Arquivos modificados
1. `src/components/admin/content/TrilhaModal.tsx` - campo cohost_nome
2. `src/components/admin/content/TrilhasTab.tsx` - coluna Cohost na tabela
