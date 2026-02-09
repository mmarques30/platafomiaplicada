
# Reestruturar secao "Impacto vs ROI" com Donut Charts por Membro + Bar Chart + Pie Chart

## O que muda

A secao de graficos em `ProjetoSkillsPerformance.tsx` (linhas 156-193) sera reescrita para seguir o layout do anexo de referencia:

### Layout novo (similar ao "Traffic effectiveness")

```
+---------------------------------------------------------------+
| Impacto vs ROI                                        Filtros  |
| (donut) Membro 1   (donut) Membro 2   (donut) Membro 3       |
|   64%                 45%                26%                   |
| Proj1 | Proj2 | Proj3  (3 projetos por membro, legenda)       |
+---------------------------------------------------------------+
| Distribuicao por Status       |  Evolucao por Semana          |
| (Pie chart - pizza)           |  (Bar chart - barras)         |
| Concluido / Em andamento /   |  Sem1 Sem2 ... Sem12          |
| Atrasado / Pendente           |  barras empilhadas            |
+---------------------------------------------------------------+
```

### Secao superior: Donut Charts por Membro

- Para cada membro da equipe, um **donut chart** (RadialBarChart ou Pie com innerRadius) mostrando o progresso geral (% de entregas concluidas)
- Abaixo de cada donut: ate 3 projetos/entregas vinculados aquele membro com indicador de progresso
- Se nao ha membros/entregas: empty state "Nenhum dado disponivel"
- Dados: `ranking` do hook (ja tem entregasConcluidas/totalEntregas por membro) + `entregas` filtradas por responsavelId
- Responsivo: 3 colunas em desktop, 1 coluna em mobile (grid-cols-1 md:grid-cols-3)

### Secao inferior esquerda: Pie Chart (distribuicao de status)

- Substitui o AreaChart atual de "Impacto vs ROI"
- Pizza/donut mostrando distribuicao das entregas por status: Concluido, Em andamento, Atrasado, Pendente
- Dados calculados a partir de `entregas` agrupadas por status
- Cores: verde (#9EB038) para concluido, amarelo para em andamento, vermelho para atrasado, cinza para pendente

### Secao inferior direita: Bar Chart (evolucao semanal)

- Substitui o BarChart de "Maturidade IA"
- Barras por semana (Sem 1 a Sem 12) com horas economizadas ou entregas concluidas
- Dados de `maturidadeChartData` ou `metricas` semanais
- Mantém as barras verticais com cores da marca

### Filtros

Os filtros existentes (Colaborador, Status) continuam funcionando e afetam os donuts e graficos abaixo.

## Arquivos a modificar

### `src/components/skills/ProjetoSkillsPerformance.tsx`
- Reescrever secao de graficos (linhas 155-193) com:
  1. Card "Impacto vs ROI" com donut charts por membro (ate 3 membros visiveis, scroll se mais)
  2. Grid 2 colunas abaixo: Pie Chart (status) + Bar Chart (evolucao semanal)
- Usar `PieChart`, `Pie`, `Cell` do recharts para donuts e pizza
- Usar `BarChart`, `Bar` para barras semanais
- Manter `ResponsiveContainer` em todos os graficos
- Dados dos donuts: calcular % de conclusao por membro a partir de `ranking`
- Cada donut mostra ate 3 entregas/projetos do membro como legenda abaixo

### Nenhum arquivo novo necessario
Tudo fica dentro do componente existente. Os dados ja estao disponiveis no hook `useSkillsLider` (ranking, entregas, metricas).

## Detalhes tecnicos

**Donut por membro** (recharts):
```
<PieChart>
  <Pie data={[{value: completed}, {value: remaining}]}
    innerRadius={30} outerRadius={45} startAngle={90} endAngle={-270}>
    <Cell fill="#9EB038" />
    <Cell fill="hsl(var(--muted))" />
  </Pie>
  <text x="50%" y="50%" textAnchor="middle">64%</text>
</PieChart>
```

**Distribuicao de status (Pie)**:
- Agrupamento: `entregas.reduce()` por status
- 4 segmentos com cores fixas

**Barras semanais**:
- `maturidadeChartData` ou novo calculo de horas por semana
- Cores da marca com gradiente

**Responsividade**:
- Donuts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Graficos inferiores: `grid-cols-1 lg:grid-cols-2`
- Filtros: mantidos como estao (ja responsivos)
