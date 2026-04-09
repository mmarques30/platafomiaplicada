

# Fix: Carrossel de Telas e Vídeos — conter dentro da página com setas

## Problema
Os placeholders do empty state em "Telas do Sistema" e "Vídeos de Instrução" não usam o carrossel Embla. Os 6 cards ficam todos visíveis em uma linha, estourando a largura da página e forçando scroll horizontal.

## Solução

**Arquivo**: `src/pages/MeuSistemaEntregas.tsx`

### Telas do Sistema (linhas 236-255)
- Envolver os placeholders no `emblaRef` existente, igual ao bloco de dados reais (linha 201)
- Adicionar `overflow-hidden` no container
- Manter as setas de navegação que já existem no header da seção (linhas 191-197)

### Vídeos de Instrução (linhas 336-368)
- Envolver os placeholders no `emblaRefVideos` existente, igual ao bloco de dados reais (linha 275)
- Adicionar `overflow-hidden` no container
- Manter as setas de navegação que já existem no header da seção (linhas 266-272)

### Mudança concreta
Nos dois blocos de empty state, trocar:
```jsx
<div className="opacity-50 pointer-events-none">
  <div className="overflow-hidden">
    <div className="flex gap-4">
```
Por:
```jsx
<div className="opacity-50 pointer-events-none">
  <div className="overflow-hidden" ref={emblaRef}> {/* ou emblaRefVideos */}
    <div className="flex gap-4">
```

Remover `pointer-events-none` do wrapper para que as setas funcionem, ou manter apenas nos cards internos.

