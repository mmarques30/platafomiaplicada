

# Fix: Conteúdo de Entregas ultrapassando a página com sidebar aberta

## Causa raiz

No `MainLayout.tsx`, o container que envolve o `<main>` é um flex item (`flex-1`) mas **não tem `min-w-0`**. Em flexbox, itens têm `min-width: auto` por padrão, o que impede que encolham abaixo da largura intrínseca do conteúdo. Quando o sidebar abre e reduz o espaço disponível, esse div se recusa a encolher, empurrando o conteúdo para fora da tela.

Mesmo com `overflow-x-hidden` no `<main>` e `overflow-hidden` na página de Entregas, o problema persiste porque o container pai não permite o encolhimento.

## Solução

**Arquivo**: `src/components/layout/MainLayout.tsx` (linha 82)

Adicionar `min-w-0` ao div que envolve o `<main>`:

```
// De:
<div className="flex-1 flex flex-col relative z-[1]">

// Para:
<div className="flex-1 flex flex-col relative z-[1] min-w-0">
```

Essa única mudança resolve o problema na raiz. O flex item passa a aceitar encolher quando o sidebar ocupa espaço, e o `overflow-x-hidden` já existente no `<main>` corta qualquer conteúdo que transborde. Funciona para a página de Entregas e qualquer outra página que tenha conteúdo largo.

