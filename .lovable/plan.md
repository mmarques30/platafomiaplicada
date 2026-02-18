
# Entregas e Subtarefas por Projeto no Acompanhamento

## O que sera feito
Transformar a tabela "Visao Geral dos Projetos" na aba Acompanhamento para mostrar **projetos do backlog** com colunas adicionais de **quantidade de entregas** e **quantidade de subtarefas** vinculadas a cada projeto.

## Situacao atual
- A `ProjetosResumoTable` recebe `entregas` (da tabela `entregas_skills`) e lista cada entrega como se fosse um projeto
- Nao mostra contagem de entregas por projeto nem subtarefas

## Solucao

### 1. `ProjetoSkillsProjetosPage.tsx`
- Buscar entregas da equipe (`entregas_equipe_skills`) com contagem de subtarefas usando query com join
- Passar tanto `projetos` (backlog) quanto `entregasEquipe` (com subtarefas) para `ProjetosResumoTable`

### 2. `ProjetosResumoTable.tsx`
- Alterar a tabela para iterar sobre **projetos** (backlog_skills) em vez de entregas
- Adicionar colunas "Entregas" e "Subtarefas" que mostram a contagem de entregas vinculadas a cada projeto e o total de subtarefas dessas entregas
- Manter colunas existentes (Status, Prioridade, Progresso) baseadas no projeto do backlog
- O progresso do projeto sera calculado como media do progresso das entregas vinculadas

### 3. Query adicional na pagina
- Buscar `entregas_equipe_skills` agrupadas por `projeto_id` com contagem de subtarefas via query inline:
```sql
entregas_equipe_skills (*, subtarefas_entregas_skills(count))
```
- Agrupar os dados por projeto para montar as contagens

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/pages/skills/ProjetoSkillsProjetosPage.tsx` | Adicionar query para buscar entregas_equipe_skills com contagem de subtarefas; passar projetos e dados agregados para ProjetosResumoTable |
| `src/components/skills/kanban/ProjetosResumoTable.tsx` | Refatorar para iterar projetos do backlog; adicionar colunas Entregas e Subtarefas com contagens; calcular progresso medio |
