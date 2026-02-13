
# Redesign Visual dos Cards no Painel Lider - Skills

## Objetivo

Aplicar um design mais sofisticado nos cards do Painel Lider (/skills/projeto/performance), inspirado na referencia visual compartilhada. O conceito mistura cards com fundos escuros (preto), cards com fundo verde transparente da marca, e cards claros, criando contraste visual e hierarquia de informacao.

## Escopo

Ajustes puramente visuais (CSS/Tailwind) nos componentes do Painel Lider. Nenhuma mudanca de banco de dados ou logica de negocio.

## Componentes Afetados

### 1. KPICard (`src/components/skills/performance/KPICard.tsx`)

Adicionar uma prop `variant` para suportar 3 estilos visuais:
- **dark**: fundo preto (#0D0D0D), texto branco, icone com fundo verde translucido
- **accent**: fundo verde transparente (bg-[#9EB038]/10), borda esquerda verde, texto escuro
- **default**: fundo card padrao (atual), mantido para compatibilidade

### 2. ProjetoSkillsPerformance (`src/components/skills/ProjetoSkillsPerformance.tsx`)

Aplicar variantes nos KPIs do Painel Lider:
- Card 1 (Horas Economizadas): variant `dark`
- Card 2 (ROI Acumulado): variant `accent`
- Card 3 (Entregas): variant `dark`
- Card 4 (Performance/Semana): variant `accent`

Intercalar dark e accent para criar ritmo visual.

### 3. MemberDonutCharts (`src/components/skills/performance/MemberDonutCharts.tsx`)

- Header do card com fundo escuro (#0D0D0D) e texto branco
- Corpo mantem fundo claro para legibilidade dos graficos

### 4. StatusPieChart (`src/components/skills/performance/StatusPieChart.tsx`)

- Card com borda esquerda verde da marca (border-l-4 border-[#9EB038])
- Fundo claro padrao mantido

### 5. WeeklyBarChart (`src/components/skills/performance/WeeklyBarChart.tsx`)

- Card com fundo escuro (#0D0D0D) para as barras de progresso
- Texto e labels em branco/cinza claro
- Barras de progresso mantendo o verde da marca

### 6. Card do Ranking (inline em ProjetoSkillsPerformance.tsx)

- Header com fundo escuro, corpo com fundo claro
- Badges de posicao mais contrastantes

### 7. Card de Filtros (inline em ProjetoSkillsPerformance.tsx)

- Borda esquerda verde da marca
- Fundo sutil verde transparente

## Detalhes Tecnicos

### KPICard - Nova interface:

```tsx
interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "dark" | "accent";
}
```

Classes por variante:
- `dark`: `bg-[#0D0D0D] border-[#0D0D0D] text-white`
- `accent`: `bg-[#9EB038]/10 border-[#9EB038]/30 border-l-4 border-l-[#9EB038]`
- `default`: `bg-card border-border` (atual)

### Mapeamento de cores de texto por variante:
- `dark`: titulo = `text-white/70`, valor = `text-white`, subtitulo = `text-white/50`
- `accent`: titulo = `text-foreground/70`, valor = `text-foreground`, subtitulo = `text-muted-foreground`

### Componentes com header escuro (MemberDonutCharts, Ranking):
```tsx
<CardHeader className="bg-[#0D0D0D] rounded-t-xl">
  <CardTitle className="text-white">...</CardTitle>
</CardHeader>
```

### WeeklyBarChart (todo escuro):
```tsx
<Card className="bg-[#0D0D0D] border-[#0D0D0D]">
  // textos em text-white e text-white/60
  // barra de fundo: bg-white/10
  // barra de progresso: bg-[#9EB038]
</Card>
```

## Arquivos Modificados

1. `src/components/skills/performance/KPICard.tsx` - Adicionar prop variant e estilos
2. `src/components/skills/ProjetoSkillsPerformance.tsx` - Aplicar variants nos KPIs, estilizar filtros e ranking
3. `src/components/skills/performance/MemberDonutCharts.tsx` - Header escuro
4. `src/components/skills/performance/StatusPieChart.tsx` - Borda esquerda verde
5. `src/components/skills/performance/WeeklyBarChart.tsx` - Fundo escuro completo
