

# Fix: Sala de Aula não aparece para visitantes

## Problema
Na linha 534 do `AppSidebar.tsx`, o `SidebarComunidadeItem` recebe `currentEnvironment` (valor bruto do contexto) em vez de `effectiveEnvironment` (valor calculado que resolve visitantes para `'gratuito'`).

Para visitantes, `currentEnvironment` pode ser `null` porque eles nunca selecionam um ambiente manualmente. A linha 28 do `SidebarComunidadeItem` faz `if (currentEnvironment !== 'gratuito') return null` — como `null !== 'gratuito'`, o componente inteiro não renderiza.

## Solução

**Arquivo**: `src/components/layout/AppSidebar.tsx`

**Linha 534**: trocar `currentEnvironment` por `effectiveEnvironment`:

```tsx
// De:
currentEnvironment={currentEnvironment}

// Para:
currentEnvironment={effectiveEnvironment}
```

Nenhuma outra alteração necessária.

