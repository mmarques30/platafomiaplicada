
# Correcao da contagem de projetos no painel

## Problema identificado
A aba "Acompanhamento" da pagina de Projetos Skills esta mostrando **48 projetos** porque o componente `PortfolioOverview` recebe dados da tabela `entregas_skills` (entregas/tarefas individuais), mas exibe com o rotulo "Total de Projetos". Na realidade existem apenas **12 projetos** na tabela `backlog_skills`.

O fluxo atual e:
- `ProjetoSkillsProjetosPage` busca dados via `useSkillsEntregas()` (tabela `entregas_skills` = 48 registros)
- Passa esses dados para `PortfolioOverview` como `entregas`
- `PortfolioOverview` conta `entregas.length` e exibe como "Total de Projetos"

## Solucao
Separar corretamente o que sao **projetos** (backlog_skills) e **entregas** (entregas_skills) no painel de acompanhamento.

### 1. `PortfolioOverview.tsx`
- Adicionar uma prop `projetos` (lista de itens do backlog) alem da prop `entregas` existente
- O KPI "Total de Projetos" passa a contar `projetos.length` (dados do `backlog_skills`)
- Os demais KPIs ("Em Producao", "Em Andamento", "Economia Total") continuam baseados nas entregas, pois sao metricas de execucao
- Adicionar um KPI "Total de Entregas" para mostrar `entregas.length`

### 2. `ProjetoSkillsProjetosPage.tsx`
- Importar `useSkillsBacklog` para obter os projetos reais
- Passar `items` do backlog como prop `projetos` para `PortfolioOverview`

### 3. Ajustes nos rotulos
- "Total de Projetos" mostra a contagem real do backlog (12)
- "Total de Entregas" mostra a contagem de entregas (48)
- Demais KPIs permanecem inalterados

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/components/skills/kanban/PortfolioOverview.tsx` | Adicionar prop `projetos`, separar contagem de projetos vs entregas |
| `src/pages/skills/ProjetoSkillsProjetosPage.tsx` | Importar `useSkillsBacklog`, passar `items` como `projetos` |
