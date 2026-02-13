
# Redesign Visual dos Cards no Submenu Projetos - Skills

## Objetivo

Aplicar o mesmo padrao visual sofisticado (dark/accent) nos cards do submenu **Projetos** (`/skills/projeto`), removendo icones dos cards e dando enfase aos numeros e titulos via cor e peso de fonte. Apenas ajustes visuais, sem mudancas de banco de dados.

## Componentes Afetados

### 1. KPICard (`src/components/skills/performance/KPICard.tsx`)

- **Remover o icone** do render (remover a prop `icon` do JSX, manter na interface por compatibilidade mas nao renderizar)
- Dar mais enfase ao valor: `font-extrabold` em vez de `font-bold`
- Titulo em `font-semibold` para destaque

### 2. ResumoPerformanceCards (`src/components/skills/visao-geral/ResumoPerformanceCards.tsx`)

- Aplicar variantes alternadas nos KPIs (mesmo padrao do Painel Lider): dark, accent, dark, accent
- Remover imports de icones do lucide (Clock, TrendingUp, etc.) ja que nao serao mais renderizados
- Passar `icon={null}` ou remover a prop

### 3. PortfolioOverview (`src/components/skills/kanban/PortfolioOverview.tsx`)

- **KPI cards internos**: alternar entre fundo escuro (`bg-[#0D0D0D]`) e fundo accent (`bg-[#9EB038]/15`)
  - "Total de Projetos": dark
  - "Em Producao": accent
  - "Em Andamento": dark
  - "Economia Total": accent
- Remover icones dos KPI cards
- Valores em **negrito** com cores contrastantes (branco no dark, preto no accent)
- Labels em cores suaves (branco/60 no dark, cinza escuro no accent)
- **Progresso Geral**: card com borda esquerda verde (`border-l-4 border-l-[#9EB038]`)
- **Distribuicao por tipo**: remover icones, alternar dark/accent nos 3 cards
- Trocar `border-dashed` por `border-solid` (borda continua, mais limpo)

### 4. EntregasProjetadasVsExecutadasChart (`src/components/skills/charts/EntregasProjetadasVsExecutadasChart.tsx`)

- Remover icone `BarChart3` do header
- Aplicar header com fundo escuro (`bg-[#0D0D0D]`) e titulo branco
- Corpo mantendo fundo claro para legibilidade do grafico

### 5. ProjetoSkillsPerformance (`src/components/skills/ProjetoSkillsPerformance.tsx`)

- Remover os icones dos KPICards (ja feito via KPICard, mas garantir que nao passe `icon`)

## Detalhes Tecnicos

### KPICard - Ajuste no render:

```tsx
// Remover a linha que renderiza o icone:
// <div className={cn(s.icon)}>{icon}</div>

// Header fica apenas com o titulo:
<CardHeader className="pb-2">
  <p className={cn("text-sm font-semibold", s.title)}>{title}</p>
</CardHeader>
<CardContent>
  <p className={cn("text-2xl font-extrabold", s.value)}>{value}</p>
  ...
</CardContent>
```

A prop `icon` sera mantida na interface mas ignorada no render para nao quebrar outros usos.

### PortfolioOverview - Novo estilo dos KPI cards:

```tsx
// Exemplo de card dark:
<div className="rounded-xl border border-[#0D0D0D] bg-[#0D0D0D] p-4 space-y-1">
  <span className="text-xs font-semibold text-white/60">{label}</span>
  <p className="text-2xl font-extrabold text-white">{value}</p>
</div>

// Exemplo de card accent:
<div className="rounded-xl border border-[#9EB038]/30 bg-[#9EB038]/15 border-l-4 border-l-[#9EB038] p-4 space-y-1">
  <span className="text-xs font-semibold text-[#3a3a3a]">{label}</span>
  <p className="text-2xl font-extrabold text-[#0D0D0D]">{value}</p>
</div>
```

### EntregasProjetadasVsExecutadasChart - Header escuro:

```tsx
<Card className="overflow-hidden">
  <CardHeader className="bg-[#0D0D0D] rounded-t-xl pb-2">
    <CardTitle className="text-base font-semibold text-white">
      Entregas Projetadas vs Executadas
    </CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

## Arquivos Modificados

1. `src/components/skills/performance/KPICard.tsx` - Remover icone do render, ajustar pesos de fonte
2. `src/components/skills/visao-geral/ResumoPerformanceCards.tsx` - Aplicar variants dark/accent alternados, remover icones
3. `src/components/skills/kanban/PortfolioOverview.tsx` - Redesign dos cards com dark/accent, remover icones
4. `src/components/skills/charts/EntregasProjetadasVsExecutadasChart.tsx` - Header escuro, remover icone
