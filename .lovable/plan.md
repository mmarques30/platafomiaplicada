

# Remover borda externa do card do Gantt

## Alteração

Arquivo: `src/components/meu-sistema/GanttEntregas.tsx`, linha 166

Adicionar `border-0 shadow-none` ao className do `<Card>` principal para remover a borda externa, mantendo todas as bordas internas intactas.

```tsx
// De:
<Card className="overflow-hidden">
// Para:
<Card className="overflow-hidden border-0 shadow-none">
```

1 linha alterada.

