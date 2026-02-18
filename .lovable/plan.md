

# Sincronizar Admin Skills com alteracoes do painel Skills

## Diagnostico
Ao comparar o painel do usuario (Skills) com o painel administrativo (Mentoria > Skills), identifiquei duas lacunas onde as funcionalidades recentes nao estao refletidas:

### 1. Aba "Entregas Equipe" no admin
- **Situacao atual**: mostra apenas campos basicos (titulo, projeto, status, prioridade, responsavel, prazo, progresso, arquivos)
- **Falta**: contagem de subtarefas por entrega e possibilidade de expandir/visualizar as subtarefas

### 2. Aba "Projetos" no admin
- **Situacao atual**: lista projetos do backlog como cards individuais com status, prioridade e responsavel
- **Falta**: contagem de entregas e subtarefas vinculadas a cada projeto (como fizemos na tabela do painel do usuario)

---

## Alteracoes propostas

### 1. `SkillsEntregasEquipeTab.tsx` — Adicionar coluna de subtarefas
- Alterar a query do hook `useEntregasEquipe` (ou fazer query inline) para incluir `subtarefas_entregas_skills(*)` no select
- Adicionar coluna "Subtarefas" na tabela mostrando `X/Y concluidas`
- Opcionalmente: ao clicar na linha, expandir para mostrar a lista de subtarefas com checkbox (somente leitura no admin)

### 2. `ProjetosMapeadosTab.tsx` — Adicionar metricas de entregas/subtarefas
- Buscar `entregas_equipe_skills` com `subtarefas_entregas_skills(*)` filtrando por `equipe_id`
- Para cada projeto, mostrar badges com contagem de entregas vinculadas e total de subtarefas
- Adicionar barra de progresso medio calculada das entregas (similar ao que fizemos no `ProjetosResumoTable`)

---

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/components/admin/skills/SkillsEntregasEquipeTab.tsx` | Adicionar query com subtarefas; nova coluna "Subtarefas" na tabela mostrando contagem (concluidas/total) |
| `src/components/admin/skills/ProjetosMapeadosTab.tsx` | Buscar entregas_equipe_skills com subtarefas; exibir badges de entregas e subtarefas em cada card de projeto; barra de progresso medio |

