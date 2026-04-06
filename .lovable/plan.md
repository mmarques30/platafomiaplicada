

# Fix: ProximosPassosCard cortado no topo

## Problema
O modal usa `display: flex; align-items: center; justify-content: center` no container fullscreen, mas o card interno tem `overflow: hidden` e nenhum `max-height`. Quando o conteúdo excede a altura da viewport, o card é empurrado para fora do topo (centralização flex com overflow).

## Solução
No `src/components/onboarding/ProximosPassosCard.tsx`:

1. **Container externo** (linha 269): adicionar `overflow-y: auto` e `padding: "16px 0"` para permitir scroll quando necessário
2. **Card interno** (linha 274): trocar `overflow: "hidden"` por `overflow: "visible"`, adicionar `maxHeight: "calc(100vh - 32px)"` e `overflowY: "auto"` no card
3. Manter `margin: "0 16px"` para padding lateral

### Alteração específica (linha 269):
```tsx
// Container: adicionar overflowY e padding vertical
style={{ position: "fixed", inset: 0, zIndex: 9998, background: "#0C0F0A", 
  display: "flex", alignItems: "center", justifyContent: "center",
  overflowY: "auto", padding: "16px 0" }}
```

### Alteração no card (linha 274):
```tsx
style={{ position: "relative", zIndex: 1, background: "#141810", 
  border: "0.5px solid rgba(175,192,64,0.15)", borderRadius: 20, 
  maxWidth: 680, width: "100%", margin: "auto 16px",
  maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}
```

Mesma correção aplicada ao estado de loading (linhas 245-262).

