

# Separar Metricas e Kanban na aba Acompanhamento

## Problema

A aba "Acompanhamento" esta renderizando `ProjetoSkillsKanban` inteiro, que inclui tanto o **PortfolioOverview** (metricas e KPIs) quanto o **kanban de entregas** (com DnD, filtros e colunas). O kanban de entregas nao deveria aparecer nessa aba -- somente os KPIs e metricas.

## Solucao

Modificar a aba "Acompanhamento" para renderizar apenas os componentes de metricas, removendo o kanban de entregas dessa visao.

### Arquivo: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

**Mudancas:**
- Remover a importacao de `ProjetoSkillsKanban`
- Importar `PortfolioOverview` diretamente de `@/components/skills/kanban/PortfolioOverview`
- Importar o hook `useSkillsEntregas` para obter os dados de entregas necessarios pelo PortfolioOverview
- Na aba "Acompanhamento", renderizar:
  1. `ResumoPerformanceCards` (KPIs de horas, ROI, entregas, semana)
  2. `PortfolioOverview` (total de projetos, em producao, em andamento, economia, progresso geral, distribuicao por tipo)
- A aba "Backlog" permanece inalterada com o `BacklogView`

### Resultado

```
Aba "Acompanhamento":
  - ResumoPerformanceCards (4 KPIs)
  - PortfolioOverview (KPIs do portfolio, barra de progresso, distribuicao por tipo)

Aba "Backlog":
  - BacklogView (kanban/tabela de projetos do backlog) -- sem alteracao
```
