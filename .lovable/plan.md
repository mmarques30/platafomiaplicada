
# Corrigir Painel do Lider - Dados Nao Refletidos

## Diagnostico

O painel do lider (`ProjetoSkillsPerformance`) tem dados no banco:
- **12 projetos** no `backlog_skills` (5 aprovados, 3 priorizados, 4 nao aprovados)
- **48 entregas** no `entregas_skills` (todas com status `pendente`)

O problema e a logica de `hasEntregas`: como existem 48 entregas (mesmo todas pendentes), o painel exibe os KPIs de entregas em vez dos KPIs de projetos. Resultado: todos os KPIs mostram zero, porque nenhuma entrega foi concluida.

## Solucao

Mudar a logica para **combinar ambas as fontes** em vez de usar uma ou outra. O painel deve mostrar dados de projetos E entregas simultaneamente, refletindo o estado real.

## Alteracoes

### 1. `useSkillsLider.ts` - Incluir novos campos ROI dos projetos

Atualizar a query de `backlog_skills` (linha 188) para incluir os novos campos `tempo_atual_horas`, `cargo_executor` e `custo_hora_executor`. Recalcular KPIs para combinar dados:

- **Horas Economizadas**: somar economia real das entregas concluidas + economia estimada dos projetos aprovados/priorizados
- **ROI Acumulado**: calcular usando `custo_hora_executor` dos projetos quando disponivel, senao usar `custo_hora_padrao` da equipe
- **Projetos Mapeados**: total de projetos no backlog (excluindo descartados)
- **Entregas em Progresso**: total de entregas nao-pendentes

### 2. `ProjetoSkillsPerformance.tsx` - KPIs hibridos

Remover a logica binaria `hasEntregas` dos KPIs e mostrar **sempre 4 KPIs relevantes** independente de haver entregas ou nao:

| KPI | Fonte | Calculo |
|---|---|---|
| Projetos Mapeados | `backlog_skills` | Total de projetos (excluindo nao_aprovado/descartado) |
| Economia Estimada | `backlog_skills` | Soma de `horas_estimadas_economia` dos projetos aprovados/priorizados |
| Entregas | `entregas_skills` | Concluidas / Total |
| ROI Projetado | Combinado | Economia estimada * custo hora * 52 semanas (anualizado) |

### 3. `ProjetoSkillsPerformance.tsx` - Ranking hibrido

O ranking deve considerar **ambas as fontes**:
- Projetos atribuidos ao membro (do `backlog_skills`)
- Entregas atribuidas ao membro (do `entregas_skills`)
- Score composto: projetos ativos + entregas concluidas + horas economizadas

### 4. Graficos (`StatusPieChart`, `MemberDonutCharts`, `WeeklyBarChart`)

- `StatusPieChart`: combinar status de projetos E entregas, ou mostrar dois pie charts lado a lado
- `MemberDonutCharts`: mostrar progresso combinado (projetos + entregas por membro)
- `WeeklyBarChart`: manter progresso por membro mas usando dados combinados

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/hooks/useSkillsLider.ts` | Adicionar campos ROI na query de projetos. Mudar KPIs para combinar projetos+entregas. Ajustar ranking para score hibrido |
| `src/components/skills/ProjetoSkillsPerformance.tsx` | Remover logica binaria `hasEntregas` dos KPIs. Exibir 4 KPIs fixos combinando ambas fontes. Ajustar filtros e labels |
| `src/components/skills/performance/StatusPieChart.tsx` | Combinar dados de projetos e entregas no grafico |
| `src/components/skills/performance/MemberDonutCharts.tsx` | Mostrar dados combinados por membro |
| `src/components/skills/performance/WeeklyBarChart.tsx` | Ajustar labels e dados para modo hibrido |

## Resultado esperado

Com os dados atuais do banco:
- **Projetos Mapeados**: 8 (5 aprovados + 3 priorizados)
- **Economia Estimada**: ~24h/semana (soma das horas dos projetos ativos)
- **Entregas**: 0/48 concluidas
- **ROI Projetado**: ~R$ 74.880/ano (24h * R$ 60 * 52 semanas)
