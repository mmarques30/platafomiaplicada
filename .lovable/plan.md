

# Substituir Acesso Rapido por Grafico de Area + Mini Calendario

## O que muda

Remover os dois botoes de "Performance" e "Diagnostico" da Visao Geral (componente `AcessoRapidoCards`), pois ja existem como submenus no dropdown "Projeto Skills". No lugar, adicionar uma secao visual com:

1. **Grafico de Area** (lado esquerdo, ~70% da largura): duas curvas sobrepostas com cores distintas — "ROI Projetado" (cinza/muted) e "ROI Executado" (verde marca). Dados vindos do `roiChartData` do hook `useSkillsLider`, que ja retorna 12 semanas com valores projetado/executado.

2. **Mini Calendario** (lado direito, ~30%): calendario compacto mostrando o mes atual, com destaque visual nos dias que tem encontros/secoes agendados (se houver dados no roadmap). Quando o usuario clica em um dia com evento, pode ver detalhes. O calendario e o grafico "conversam" — ao passar o mouse em uma semana no grafico, o calendario pode destacar o periodo correspondente.

## Alteracoes

### Arquivo 1: `src/pages/skills/ProjetoSkills.tsx`
- Remover import e uso do `AcessoRapidoCards`
- Adicionar novo componente `GraficoCalendarioSection`

### Arquivo 2: `src/components/skills/visao-geral/AcessoRapidoCards.tsx`
- **Deletar** este arquivo (nao sera mais usado)

### Arquivo 3 (novo): `src/components/skills/visao-geral/GraficoCalendarioSection.tsx`
Componente com layout side-by-side:

```
+--------------------------------------------------+
| [Grafico de Area - 2 curvas]  | [Mini Calendario] |
| ROI Projetado (cinza)         |    Fev 2026       |
| ROI Executado (verde)         |  D S T Q Q S S    |
|                               |  ... dias ...     |
+--------------------------------------------------+
```

**Grafico**: Usa `AreaChart` do recharts com `ChartContainer` do shadcn. Duas `Area` com `fillOpacity` para efeito visual similar ao anexo (areas preenchidas com gradiente). Legenda no topo esquerdo com bolinhas coloridas.

**Calendario**: Usa o componente `Calendar` do shadcn (react-day-picker) em modo compacto. Dias com entregas/encontros marcados com um ponto ou fundo colorido (laranja como no anexo de referencia). O dia atual destacado.

**Responsividade**: Em mobile, empilha verticalmente (grafico em cima, calendario embaixo).

**Dados**: Reutiliza `useSkillsLider()` para `roiChartData` e `entregas` (para marcar dias de prazo no calendario).

## Layout da pagina final

```
Titulo: Projeto Skills
-----
Card: Diagnostico da Equipe (barra de progresso + membros + botao)
-----
Cards: KPIs (Horas Economizadas | ROI | Entregas | Semana)
-----
Card: Grafico de Area + Mini Calendario (lado a lado)
```

## Detalhes tecnicos

- Recharts: `AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`
- Cores das areas: verde marca `hsl(78, 54%, 34%)` para executado, cinza `hsl(var(--muted-foreground))` para projetado
- Gradientes via `<defs><linearGradient>` para o efeito de preenchimento suave
- Calendario: `Calendar` de `@/components/ui/calendar` com `modifiers` para dias com eventos
- Dias com prazo de entrega marcados com estilo laranja/destaque
