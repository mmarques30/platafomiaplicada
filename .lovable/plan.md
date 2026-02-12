

# Ver Backlog de Projetos na Pagina de Projetos (Kanban + Tabela + Detalhamento)

## Problema Atual

A pagina de Projetos (`/skills/projeto/projetos`) mostra o Kanban das **entregas** (tabela `entregas_skills`), mas o usuario quer ver o **backlog de projetos** (tabela `backlog_skills`). Alem disso, ao clicar em um card/linha, deve abrir um modal com o detalhamento completo do projeto.

## Dados Disponiveis no Backlog

Cada projeto em `backlog_skills` tem:
- titulo, descricao, area_impactada
- status (levantado, em_andamento, concluido, descartado)
- prioridade (alta, media, baixa)
- responsavel_id (FK para profiles)
- horas_estimadas_economia
- tags (array), origem (ia/manual)

## Solucao

### 1. Criar toggle Kanban / Tabela

Adicionar botoes de alternancia (icones LayoutGrid e List) no topo da pagina para trocar entre visualizacao Kanban e Tabela.

### 2. Criar componente `BacklogKanban`

Novo Kanban alimentado por `backlog_skills` ao inves de `entregas_skills`:
- Colunas: LEVANTADO, EM ANDAMENTO, CONCLUIDO
- Cards mostram: titulo, descricao truncada, area_impactada, prioridade, responsavel, horas estimadas
- Drag-and-drop para mudar status
- Ao clicar no card, abre modal de detalhes

### 3. Criar componente `BacklogTable`

Tabela com as colunas: Titulo, Area, Status, Prioridade, Responsavel, Economia (h/sem)
- Clique na linha abre o mesmo modal de detalhes
- Ordenacao por colunas

### 4. Criar componente `ProjetoDetailModal`

Modal (Dialog) que exibe todos os campos do projeto:
- Titulo e descricao completa
- Area impactada, prioridade, status
- Responsavel (avatar + nome)
- Horas estimadas de economia
- Tags
- Origem (IA ou Manual)
- Lista de entregas vinculadas (de `entregas_skills` filtradas pelo projeto)

### 5. Criar hook `useBacklogSkills`

Hook dedicado para buscar projetos do backlog com join de responsavel e mutation para atualizar status (drag-and-drop).

### 6. Atualizar `ProjetoSkillsProjetosPage`

Substituir o componente `ProjetoSkillsKanban` (que mostra entregas) pelo novo componente que mostra o backlog com toggle Kanban/Tabela.

## Arquivos

**Novos:**
- `src/components/skills/backlog/BacklogKanban.tsx` -- Kanban board do backlog
- `src/components/skills/backlog/BacklogTable.tsx` -- Tabela do backlog
- `src/components/skills/backlog/BacklogCard.tsx` -- Card de projeto para Kanban
- `src/components/skills/backlog/ProjetoDetailModal.tsx` -- Modal de detalhes do projeto
- `src/components/skills/backlog/BacklogView.tsx` -- Container com toggle Kanban/Tabela

**Modificados:**
- `src/pages/skills/ProjetoSkillsProjetosPage.tsx` -- usar BacklogView ao inves de ProjetoSkillsKanban
- `src/hooks/useSkillsBacklog.ts` -- adicionar mutation de status e buscar responsavel com join correto

## Resultado

- Pagina de Projetos mostra os projetos do backlog (nao entregas)
- Toggle entre Kanban e Tabela
- Clicar em qualquer projeto abre modal com todos os detalhes
- Drag-and-drop no Kanban atualiza status do projeto
