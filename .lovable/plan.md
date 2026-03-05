

# Background off-white interno do Gantt

## Alteração

Arquivo: `src/components/meu-sistema/GanttEntregas.tsx`

Adicionar `background: "#FAFAF5"` (off-white) ao container principal interno do Gantt (a `div` com `className="flex border-t border-border"` na linha 187), para que toda a área interna (sidebar + timeline) tenha fundo off-white.

```tsx
// Linha 187 — adicionar style com background
<div className="flex border-t border-border" style={{ height: "420px", background: "#FAFAF5" }}>
```

1 linha alterada.

**Nota:** Aguardando o restante da solicitação do usuário (mensagem terminou em "e").

