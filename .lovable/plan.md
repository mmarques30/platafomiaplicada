
# Grafico de Barras: Entregas Projetadas vs Executadas por Mes

## Objetivo

Adicionar um grafico de barras abaixo do `PortfolioOverview` na aba "Acompanhamento", comparando entregas projetadas (baseadas no campo `prazo`) vs executadas (baseadas no campo `concluido_em`) agrupadas por mes.

## Logica de Dados

Usando os dados de `entregas` ja disponiveis no hook `useSkillsEntregas`:

- **Projetadas por mes**: contar entregas cujo campo `prazo` cai em cada mes
- **Executadas por mes**: contar entregas cujo campo `concluido_em` cai em cada mes
- Agrupar os ultimos 6 meses (ou o range disponivel nos dados)
- Formato de label: "Jan", "Fev", "Mar", etc.

## Implementacao

### 1. Novo componente: `src/components/skills/charts/EntregasProjetadasVsExecutadasChart.tsx`

- Recebe `entregas` como prop
- Processa os dados agrupando por mes usando `date-fns` (ja instalado)
- Renderiza um `BarChart` do Recharts com duas barras lado a lado:
  - **Projetadas** (cor muted/cinza)
  - **Executadas** (cor verde do branding `#9EB038`)
- Usa `chartColors` do design system existente em `src/lib/chartColors.ts`
- Encapsulado em um `Card` com titulo "Entregas Projetadas vs Executadas"
- Tooltip customizado seguindo o padrao dos outros graficos do projeto

### 2. Modificar: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

- Importar o novo componente
- Renderizar abaixo do `PortfolioOverview` na aba "Acompanhamento":

```
<TabsContent value="acompanhamento" className="space-y-6">
  <ResumoPerformanceCards />
  <PortfolioOverview entregas={entregas ?? []} />
  <EntregasProjetadasVsExecutadasChart entregas={entregas ?? []} />
</TabsContent>
```

### Estrutura visual

- Card com icone `BarChart3` e titulo "Entregas Projetadas vs Executadas"
- Barras agrupadas por mes, duas cores (cinza para projetadas, verde para executadas)
- Legenda inline abaixo do grafico
- Altura do grafico: ~250px
- Responsivo com `ResponsiveContainer`
