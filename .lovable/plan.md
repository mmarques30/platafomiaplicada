
# Plano: Corrigir Corte do Menu Lateral no Modo Simulação

## Problema Identificado
Quando o modo de simulação está ativo, o menu lateral (sidebar) fica parcialmente cortado porque não considera a altura adicional do banner amarelo de simulação.

### Layout Atual

```text
+---------------------------------------------+
| Banner Simulação (40px) - py-2, z-[60]      |  <-- fixed top-0
+---------------------------------------------+
| Header Principal (56px) - h-14, z-50        |  <-- fixed top-10 (quando simulando)
+---------------------------------------------+
| Sidebar (pt-14) | Conteúdo (pt-14)          |  <-- Problema: só 56px de padding
+---------------------------------------------+
```

### Medidas
| Elemento | Altura | Classe |
|----------|--------|--------|
| Banner simulação | 40px | `py-2 text-sm` |
| Header principal | 56px | `h-14` |
| Espaço necessário (simulando) | 96px | `pt-24` |
| Espaço atual | 56px | `pt-14` |

## Solução

Adicionar condição para ajustar o padding-top quando `isViewingAs` está ativo:

### Arquivo 1: `src/components/layout/MainLayout.tsx`

**Mudança:**
- Importar `useAdminViewContext` para detectar modo simulação
- Alterar `pt-14` para condicional baseado em `isViewingAs`

```tsx
// Importar o context
import { useAdminViewContext } from "@/contexts/AdminViewContext";

// Dentro do componente
const { isViewingAs } = useAdminViewContext();
const { isAdmin } = useUserRole();

// Na div principal (linha 54)
<div className={cn(
  "min-h-screen flex w-full bg-background",
  isAdmin && isViewingAs ? "pt-24" : "pt-14"
)}>
```

### Arquivo 2: `src/components/layout/AppSidebar.tsx`

**Mudança:**
- Já tem acesso a `isViewingAs` via `useAdminViewContext`
- Alterar `pt-14` para condicional

```tsx
// Na linha 115
<Sidebar className={cn(
  "border-r border-sidebar-border bg-sidebar",
  isViewingAs ? "pt-24" : "pt-14"
)}>
```

## Cálculo
- `pt-14` = 3.5rem = 56px (header normal)
- `pt-24` = 6rem = 96px (banner 40px + header 56px)

## Impacto
- **Modo normal**: Nenhuma mudança visual
- **Modo simulação**: Sidebar e conteúdo ficam abaixo do banner + header, sem corte
