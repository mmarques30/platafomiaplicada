

# Reestruturar Pagina de Projetos com Sub-abas Internas

## Problema

A pagina "Projetos" (`ProjetoSkillsProjetosPage`) atualmente so exibe o `BacklogView` (kanban e tabela de projetos). Dados importantes de acompanhamento como KPIs, Portfolio Overview, progresso geral e o kanban de entregas vinculadas foram perdidos.

## Solucao

Adicionar **duas sub-abas internas** na pagina de Projetos:

1. **Acompanhamento** -- visao geral com KPIs de performance, Portfolio Overview (entregas em producao, em andamento, economia total, progresso geral, distribuicao por tipo) e o kanban de entregas (`ProjetoSkillsKanban`)
2. **Backlog** -- a view atual com kanban/tabela de projetos do backlog (`BacklogView`)

## Estrutura Visual

```text
Projeto Skills
+-----------------------------------------------+
| [Acompanhamento]  [Backlog]                   |
+-----------------------------------------------+

Aba "Acompanhamento":
  - KPIs: Horas Economizadas | ROI | Entregas | Semana
  - Portfolio Overview (total, producao, andamento, economia)
  - Progresso geral (barra)
  - Kanban de Entregas (Backlog | Em Andamento | Validacao | Rodando)

Aba "Backlog":
  - Toggle Kanban/Tabela
  - Cards dos projetos do backlog_skills
```

## Detalhes Tecnicos

### Arquivo modificado: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

Mudancas:
- Importar `Tabs, TabsList, TabsTrigger, TabsContent`
- Importar `ResumoPerformanceCards` (KPIs existentes)
- Importar `ProjetoSkillsKanban` (kanban de entregas com PortfolioOverview integrado)
- Importar `BacklogView` (ja existente)
- Renderizar duas abas: "Acompanhamento" (default) com KPIs + ProjetoSkillsKanban, e "Backlog" com BacklogView
- Nenhum componente novo precisa ser criado -- todos ja existem

### Componentes reutilizados (sem alteracao)
- `ResumoPerformanceCards` -- KPIs de horas, ROI, entregas, semana
- `ProjetoSkillsKanban` -- Portfolio Overview + Kanban de entregas com DnD e filtros
- `BacklogView` -- Kanban/Tabela do backlog de projetos
