

# Grade pontilhada sutil no background — páginas autenticadas

## Abordagem
Em vez de adicionar o `div.dot-grid-bg` em cada página individualmente, adicionar uma única vez no `MainLayout.tsx` (cobre todas as páginas autenticadas) e garantir que o conteúdo fique acima com `relative z-[1]`.

## 1. `src/index.css` — adicionar classe `.dot-grid-bg`
Após `.card-interactive:active`, adicionar:
```css
.dot-grid-bg {
  background-image: radial-gradient(circle, #AFC040 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.025;
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
```

## 2. `src/components/layout/MainLayout.tsx`
Dentro do `div.min-h-screen` (linha 72-75), adicionar `<div className="dot-grid-bg" />` como primeiro filho, e adicionar `relative z-[1]` ao `flex-1 flex flex-col` div que contém o `<main>`.

```tsx
<div className={cn("min-h-screen flex w-full bg-background", ...)}>
  <div className="dot-grid-bg" />
  <AppSidebar />
  <div className="flex-1 flex flex-col relative z-[1]">
    ...
  </div>
  ...
</div>
```

Isso cobre Dashboard, Mentoria, Trilhas, Evolução e todas as páginas autenticadas sem tocar em páginas públicas (que usam layouts separados).

## Arquivos
- **Editados**: `src/index.css` (1 classe), `src/components/layout/MainLayout.tsx` (2 linhas)

