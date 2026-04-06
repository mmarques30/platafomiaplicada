

# Fix: ProximosPassosCard aparecendo atrás do header/sidebar

## Problema
O card de Próximos Passos está renderizando no topo da tela mas não cobre o layout inteiro — o TopHeader (`fixed z-50`) e o conteúdo do dashboard ficam visíveis por baixo/acima do card.

O ProximosPassosCard é renderizado na linha 106 do `MainLayout.tsx`, fora do `SidebarProvider`, mas o overlay fullscreen (`position: fixed; inset: 0; z-index: 9998`) deveria cobrir tudo.

## Causa provável
O `z-index: 9998` no style inline deveria ser suficiente, mas o TopHeader com `z-50` (Tailwind) e o container do conteúdo com `relative z-[1]` podem estar em stacking contexts diferentes. Além disso, a renderização dentro do fragment `<>...</>` pode não garantir a sobreposição visual esperada.

## Solução
Usar um **React Portal** para renderizar o ProximosPassosCard diretamente no `document.body`, garantindo que fique fora de qualquer stacking context do layout.

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/ProximosPassosCard.tsx` | Editar — envolver o render em `createPortal(... , document.body)` |

## Detalhes

1. Importar `createPortal` de `react-dom`
2. No return final (tanto o loading state quanto o modal principal), envolver em `createPortal(..., document.body)`
3. Isso garante que o overlay é injetado como filho direto do `<body>`, escapando de qualquer stacking context criado por SidebarProvider, TopHeader ou outros wrappers

Nenhuma outra alteração necessária.

