
# Redesign da pagina Projetos Skills conforme mockup

## Resumo

Redesenhar a pagina de Projetos para incluir duas secoes: (1) **Visao Geral do Portfolio** com KPIs, barra de progresso geral e distribuicao por tipo; (2) **Backlog de Projetos** como Kanban com cards mais ricos, filtros avancados e dados do backlog_skills vinculado.

## Alteracoes no banco de dados

### Adicionar campos faltantes na tabela `entregas_skills`
A tabela atual nao tem campo `tipo` (Individual/Colaborativo/Sistema) nem `prioridade` (P1/P2/P3). Esses dados existem parcialmente no `backlog_skills` vinculado (campo `prioridade` e `origem`), mas para simplificar a consulta e suportar o filtro, adicionar:
- `tipo` (text, nullable, default 'individual') - valores: 'individual', 'colaborativo', 'sistema'
- `prioridade` (text, nullable, default 'P3') - valores: 'P1', 'P2', 'P3'
- `processos_resolvidos` (integer, nullable, default 0) - numero de processos que a entrega resolve

## Secao 1: Visao Geral do Portfolio

Novo componente `src/components/skills/kanban/PortfolioOverview.tsx`

### KPIs (4 cards em grid)
Calculados a partir dos dados de `entregas_skills`:
- **Total de Projetos**: contagem total
- **Em Producao**: status "concluido" ou "aprovada"
- **Em Andamento**: status "em_andamento"
- **Economia Total**: soma de `economia_horas_semana` (Xh por semana)

### Barra de progresso geral
- Barra unica mostrando percentual medio de progresso de todas as entregas
- Legenda abaixo: "X concluidos | Y em andamento | Z no backlog"

### Distribuicao por tipo
- 3 cards: Individuais (contagem + %), Colaborativos (contagem + %), De Sistema (contagem + %)

## Secao 2: Backlog de Projetos (Kanban redesenhado)

### Colunas atualizadas
Renomear para alinhar com o mockup:

| Coluna | Status | Cor header |
|--------|--------|------------|
| BACKLOG | pendente | sem cor (neutro) |
| EM ANDAMENTO | em_andamento | verde oliva claro |
| EM VALIDACAO | aguardando_validacao | amarelo claro |
| RODANDO | concluido, aprovada | sem cor (neutro) |

### Filtros avancados
Substituir o filtro atual (so por responsavel) por 4 dropdowns + toggle:
- **Status**: Todos / Backlog / Em Andamento / Em Validacao / Rodando
- **Tipo**: Todos / Individual / Colaborativo / Sistema
- **Responsavel**: Todos / lista de membros
- **Prioridade**: Todas / P1 / P2 / P3
- **Toggle "Meus projetos"**: filtra apenas entregas do usuario logado

Novo componente: `src/components/skills/kanban/KanbanFiltersAdvanced.tsx`

### Cards redesenhados
Atualizar `KanbanCard.tsx` para incluir:

```text
+------------------------------------------+
| Titulo do Projeto                        |
|                   [Badge Tipo] [Badge Pn] |
|                                          |
| (!) Atrasado: Prazo era DD/MM  (se aplic)|
|                                          |
| [Avatar] Nome Responsavel                |
|                                          |
| Resolve: X processos                     |
|                                          |
| Progresso              XX%              |
| [=========----------]                    |
|                                          |
| (clock) DD/MM      (trend) Xh/sem       |
|                                          |
| [Badge Status]                           |
+------------------------------------------+
```

Novos elementos no card:
- **Badges de tipo e prioridade** no topo direito (tipo com icone colorido, prioridade com cor por nivel)
- **Alerta de atraso** com texto "Atrasado: Prazo era DD/MM" em fundo vermelho claro
- **"Resolve: X processos"** texto abaixo do responsavel
- **Badge de status** no rodape do card

### Estilo visual
Seguir o mockup: bordas arredondadas com borda pontilhada sutil nos cards, cores de marca (#738925 para verde oliva), fundo bege claro nos cards de KPI.

## Arquivos a criar/modificar

| Arquivo | Acao |
|---------|------|
| `entregas_skills` (migration) | Adicionar colunas tipo, prioridade, processos_resolvidos |
| `src/components/skills/kanban/PortfolioOverview.tsx` | CRIAR - secao de visao geral |
| `src/components/skills/kanban/KanbanFiltersAdvanced.tsx` | CRIAR - filtros avancados |
| `src/components/skills/kanban/KanbanCard.tsx` | MODIFICAR - card mais rico |
| `src/components/skills/kanban/KanbanColumn.tsx` | MODIFICAR - estilo das colunas |
| `src/components/skills/ProjetoSkillsKanban.tsx` | MODIFICAR - integrar overview, novos filtros, renomear colunas |
| `src/pages/skills/ProjetoSkillsProjetosPage.tsx` | MODIFICAR - titulo "Backlog de Projetos" |
| `src/hooks/useSkillsEntregas.ts` | MODIFICAR - buscar campos extras (tipo, prioridade, processos_resolvidos) |

## Fluxo de dados

O hook `useSkillsEntregas` ja busca entregas com responsavel. Sera atualizado para incluir os novos campos na query. O `PortfolioOverview` recebera a lista de entregas como prop e calculara os KPIs no frontend (useMemo). Os filtros avancados aplicarao filtros combinados (status + tipo + responsavel + prioridade) antes de distribuir nas colunas do Kanban.
