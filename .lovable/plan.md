

# Trocar preto por verde da marca no painel do lider

Todos os cards com headers pretos (`#0D0D0D`) e textos pretos nos KPIs serao atualizados para usar o verde da marca (`#9EB038`).

## Alteracoes

### 1. KPICard.tsx - Variante "accent" com textos verdes

A variante `accent` atualmente usa textos pretos (`#0D0D0D`, `#1a1a1a`, `#3a3a3a`). Trocar para tons do verde da marca:

| Propriedade | Antes | Depois |
|---|---|---|
| `title` | `text-[#1a1a1a]` | `text-[#6B7A20]` |
| `value` | `text-[#0D0D0D]` | `text-[#4A5516]` |
| `subtitle` | `text-[#3a3a3a]` | `text-[#6B7A20]/70` |

A variante `dark` tambem troca o fundo preto para verde escuro:

| Propriedade | Antes | Depois |
|---|---|---|
| `card` | `bg-[#0D0D0D] border-[#0D0D0D]` | `bg-[#4A5516] border-[#4A5516]` |

### 2. Headers dos cards de graficos - Verde no lugar de preto

Todos os `CardHeader` com `bg-[#0D0D0D]` passam para `bg-[#4A5516]` (verde escuro da marca):

- **ProjetoSkillsPerformance.tsx** - Header "Ranking por Colaborador" (linha 138)
- **MemberDonutCharts.tsx** - Header "Impacto vs ROI" (linhas 116, 131)

### 3. WeeklyBarChart.tsx - Card inteiro verde escuro

O card "Evolucao de Maturidade" tem fundo totalmente preto. Trocar:

| Propriedade | Antes | Depois |
|---|---|---|
| Card bg | `bg-[#0D0D0D] border-[#0D0D0D]` | `bg-[#4A5516] border-[#4A5516]` |

### 4. StatusPieChart.tsx - Borda lateral verde (ja esta, manter)

A borda `border-l-[#9EB038]` ja usa verde, nenhuma alteracao necessaria.

### Resumo de arquivos

| Arquivo | Alteracao |
|---|---|
| `KPICard.tsx` | Textos accent para verde, fundo dark para verde escuro |
| `ProjetoSkillsPerformance.tsx` | Header ranking: preto para verde escuro |
| `MemberDonutCharts.tsx` | 2 headers: preto para verde escuro |
| `WeeklyBarChart.tsx` | Card inteiro: preto para verde escuro |

Cor verde escuro escolhida: `#4A5516` (tom escuro do verde `#9EB038` da marca, mantendo contraste com texto branco).
