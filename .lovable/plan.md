
# Subtarefas nas Entregas

## O que sera feito
Adicionar um sistema de **subtarefas** dentro de cada entrega, permitindo quebrar uma entrega em tarefas menores, atribuir responsaveis a cada uma, e calcular o progresso da entrega com base na conclusao das subtarefas.

## Fluxo do usuario
1. Ao editar uma entrega no modal, uma secao "Subtarefas" aparece abaixo dos campos existentes
2. O usuario clica em "Adicionar Subtarefa", preenche titulo e seleciona um responsavel
3. Cada subtarefa tem um checkbox para marcar como concluida
4. O progresso da entrega e recalculado automaticamente com base nas subtarefas concluidas (ex: 3 de 5 = 60%)
5. Se nao houver subtarefas, o slider manual de progresso continua funcionando normalmente

## Alteracoes

### 1. Migracao de banco de dados
Nova tabela `subtarefas_entregas_skills`:

| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | Identificador |
| entrega_equipe_id | UUID FK -> entregas_equipe_skills | Entrega pai |
| titulo | TEXT NOT NULL | Nome da subtarefa |
| responsavel_id | UUID FK -> profiles | Quem executa |
| concluida | BOOLEAN DEFAULT false | Status |
| created_at | TIMESTAMPTZ | Criacao |
| updated_at | TIMESTAMPTZ | Atualizacao |

RLS: mesmas regras da tabela pai (membros da equipe e admins)

### 2. `EntregaEquipeModal.tsx`
- Adicionar secao "Subtarefas" com:
  - Lista de subtarefas existentes (checkbox + titulo + avatar do responsavel + botao remover)
  - Input inline para adicionar nova subtarefa (titulo + select de responsavel)
  - Calculo automatico do progresso quando ha subtarefas (sobrescreve o slider manual)
- Quando ha subtarefas, o slider de progresso fica desabilitado e mostra o valor calculado
- Quando nao ha subtarefas, o slider manual continua funcionando

### 3. Hook ou queries inline
- Buscar subtarefas por `entrega_equipe_id` ao abrir o modal
- CRUD de subtarefas (insert, update concluida, delete) com invalidacao de cache
- Recalcular progresso da entrega pai ao alterar subtarefas

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| Migracao SQL | Criar tabela `subtarefas_entregas_skills` com RLS |
| `src/components/skills/EntregaEquipeModal.tsx` | Secao de subtarefas com CRUD inline e calculo de progresso |
