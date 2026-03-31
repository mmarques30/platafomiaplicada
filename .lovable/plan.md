

# Refinar botão flutuante da MarIAna para pill horizontal

## Alteração única: `src/components/shared/MarIAnaFloatingButton.tsx`

### O que muda
- Botão circular com ícone/logo → pill horizontal com texto "✱ MarIAna"
- Remover logo image, `logoError` state, `MessageSquare` import, Tooltip wrapper (tooltip redundante com texto visível)
- Novo estilo inline: `bg-[#AFC040]`, texto `#0C0F0A`, `min-w-[110px]`, `rounded-[20px]`, `font-size 13px`, `font-weight 500`
- Hover: `hover:opacity-[0.88]`, `transition-opacity duration-150`
- Sem `shadow-lg`/`shadow-xl`
- Manter `fixed bottom-6 right-6` (desktop) e `bottom-4 right-4` (mobile) com `z-50`
- Manter `data-tour="mariana-button"`, `onClick`, e toda lógica de `isOpen`/`AnimatePresence`

### Resultado
```tsx
<button
  data-tour="mariana-button"
  onClick={() => setIsOpen(true)}
  className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 
    min-w-[110px] h-9 px-4 rounded-[20px] 
    bg-[#AFC040] text-[#0C0F0A] 
    text-[13px] font-medium
    hover:opacity-[0.88] transition-opacity duration-150"
>
  ✱ MarIAna
</button>
```

## Arquivos editados: 1
- `src/components/shared/MarIAnaFloatingButton.tsx`

