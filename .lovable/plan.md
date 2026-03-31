

# Substituir classes hardcoded por tokens do design system nos skeletons

## Arquivo: `src/components/shared/PageSkeleton.tsx`

### SkeletonBlock (linha 3)
- `bg-white/5` → `bg-muted/60`

### SkeletonCard (linha 7)
- `bg-zinc-900/50` → `bg-muted`
- `border-white/5` → `border-border`

### Dentro das variantes — overrides `bg-white/10` (linhas 53-55, 71-73, 79, 81, 83-84, 86, 104, 107)
- `bg-white/10` → `bg-muted/40`

### Borders inline (linha 81)
- `border-white/5` → `border-border/50`

## Arquivo: `src/components/ui/SkeletonCard.tsx`
- Já usa tokens corretos (`bg-card/60`, `bg-muted/40`, `border-border`). Nenhuma alteração necessária.

## Resumo de substituições em PageSkeleton
| De | Para |
|---|---|
| `bg-white/5` | `bg-muted/60` |
| `bg-zinc-900/50` | `bg-muted` |
| `border-white/5` | `border-border` ou `border-border/50` |
| `bg-white/10` | `bg-muted/40` |

Nenhuma alteração de estrutura, variantes, props ou lógica.

