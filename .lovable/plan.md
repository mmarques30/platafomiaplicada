
# Substituir "Evolucao por Semana" por Barras de Progresso por Pessoa (estilo Saving Plans)

## O que muda

O componente `WeeklyBarChart` atual (grafico de barras recharts) sera substituido por uma visualizacao no estilo do anexo "Saving Plans": barras de progresso horizontais agrupadas por membro, mostrando ate 3 projetos/entregas por pessoa com percentual de conclusao.

## Layout visual

```
+-----------------------------------------------+
| Evolucao de Maturidade                        |
| Total Entregas: 12                            |
|                                               |
| Joao Silva                                    |
| $concluidas / $total           45%            |
| [=============================-------]        |
|                                               |
| Maria Santos                                  |
| $concluidas / $total           25%            |
| [===============---------------------]        |
|                                               |
| Pedro Lima                                    |
| $concluidas / $total           80%            |
| [====================================-]       |
+-----------------------------------------------+
```

Cada barra mostra:
- Nome do membro
- Entregas concluidas / total (texto esquerdo)
- Percentual (texto direito)
- Barra horizontal com preenchimento verde marca (`hsl(72, 50%, 35%)`) sobre fundo muted

## Alteracoes

### Arquivo: `src/components/skills/performance/WeeklyBarChart.tsx`
Reescrever completamente. Em vez de receber `data` (maturidadeChartData), receber `ranking` e `entregas` (mesmos dados ja disponiveis no componente pai).

Nova interface:
```typescript
interface MemberProgressBarsProps {
  ranking: RankingItem[];
  entregas: Entrega[];
}
```

Logica:
- Para cada membro em `ranking`, calcular % = (entregasConcluidas / totalEntregas) * 100
- Mostrar no topo um resumo total (soma de todas entregas concluidas / total)
- Cada membro e uma linha com: nome, "X / Y entregas", barra de progresso CSS (div com width em %), e "Z%"
- Barra usa Tailwind: div externa `bg-muted rounded-full h-3`, div interna `bg-[hsl(72,50%,35%)] rounded-full h-3` com `style={{ width: pct + '%' }}`
- Empty state se ranking vazio

### Arquivo: `src/components/skills/ProjetoSkillsPerformance.tsx`
Atualizar a chamada do componente (linha 140) para passar `ranking` e `filteredDeliveries` em vez de `maturidadeChartData`.

```tsx
// De:
<WeeklyBarChart data={maturidadeChartData} />

// Para:
<WeeklyBarChart ranking={ranking} entregas={filteredDeliveries} />
```

## Detalhes tecnicos

- Sem dependencia de recharts neste componente (barras puramente CSS/Tailwind)
- Responsivo nativamente (barras se adaptam ao container)
- Cores: verde marca para barra preenchida, `bg-muted` para fundo
- Ordenacao: mantida pela posicao do ranking (ja vem ordenado)
- Componente renomeado internamente mas arquivo mantem o nome para nao quebrar imports
