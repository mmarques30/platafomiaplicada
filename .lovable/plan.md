
# Clarear cores dos cards escuros na Performance

## Problema

Os cards "Evolucao de Maturidade", "Impacto vs ROI" e "Ranking por Colaborador" usam fundo verde escuro solido (`#4A5516`) que destoa da identidade visual clean da marca. Devem usar fundo claro com acentos suaves de verde.

## Abordagem

Substituir o fundo escuro solido por fundo claro (`bg-card`) com header usando verde transparente (`bg-[#9EB038]/10`), mantendo textos em cores padrao do sistema. Isso segue o mesmo padrao "accent" ja usado nos KPI cards.

## Alteracoes

### 1. `src/components/skills/performance/WeeklyBarChart.tsx`

- Card: `bg-[#4A5516]` -> `bg-card border-border`
- Remover classe `dark-header`
- Textos brancos -> cores do sistema (`text-foreground`, `text-muted-foreground`)
- Barra de progresso background: `bg-white/10` -> `bg-muted`
- Header: adicionar `bg-[#9EB038]/10 rounded-t-xl`

### 2. `src/components/skills/performance/MemberDonutCharts.tsx`

- Headers: `bg-[#4A5516]` -> `bg-[#9EB038]/10`
- Remover classe `dark-header`

### 3. `src/components/skills/ProjetoSkillsPerformance.tsx`

- Header do Ranking: `bg-[#4A5516]` -> `bg-[#9EB038]/10`
- Remover classe `dark-header`

### 4. `src/components/skills/performance/KPICard.tsx`

- Variante `dark`: atualizar de `bg-[#4A5516]/80` para `bg-[#9EB038]/15 border-[#9EB038]/30`
- Textos da variante dark: de brancos para cores do sistema

## Resultado

Todos os cards passam a ter fundo claro com header em verde suave transparente, alinhados com a estetica clean e leve da marca.
