

# Corrigir Layout dos Graficos de Rosca (Donut Charts)

## Problema

Os graficos de rosca na secao "Impacto vs ROI" estao quebrando em 3+1 em vez de ficarem todos lado a lado na mesma linha.

## Solucao

### Arquivo: `src/components/skills/performance/MemberDonutCharts.tsx`

Alterar o grid da linha 113 para usar `grid-cols-2 md:grid-cols-4` em vez de `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, permitindo que ate 4 membros fiquem na mesma linha. Para equipes maiores, usar `flex-wrap` com largura fixa por item para manter a consistencia:

```typescript
// ANTES (linha 113):
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// DEPOIS:
<div className="flex flex-wrap justify-center gap-6">
```

Cada `MemberDonut` ja tem largura controlada (`max-w-[120px]` no nome), entao usar `flex-wrap` com `justify-center` garante que todos fiquem lado a lado enquanto couberem, e quebrem de forma natural apenas quando o espaco nao for suficiente.

## Resultado

Os 4 graficos de rosca (Lucio, Livia, Antonio, Erich) ficarao todos na mesma linha, centralizados, sem quebra desnecessaria.

