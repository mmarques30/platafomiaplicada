
# Criar SkeletonCard e aplicar nos carregamentos

## 1. Novo componente: `src/components/ui/SkeletonCard.tsx`
Props: `variant` ("kpi" | "list" | "chart"), `count?` (default 1).

| Variante | Altura | Detalhes |
|----------|--------|----------|
| kpi | 80px | Barra 3px no topo (cor primária), dois blocos internos lado a lado |
| list | 48px | Dois blocos inline (um largo, um curto) |
| chart | 200px | Bloco único interno simulando gráfico |

Animação: `@keyframes skeleton-pulse` opacidade 0.4 → 0.8, 1.5s ease-in-out infinite.
Background: `bg-card` com opacity 0.6, borda `border-border`.

## 2. Integrações

### `MentoriaEntregas.tsx` (linhas 68-77)
Substituir o loading atual por: 4x `SkeletonCard variant="list"` dentro do container existente.

### `MentoriaSessoes.tsx` (linhas 71-76)
Substituir o spinner `Loader2` por: 3x `SkeletonCard variant="list"` dentro de container com padding.

### `Mentoria.tsx`
Não tem loading state próprio (cada sub-componente carrega individualmente) — sem alteração necessária aqui. Os componentes internos da aba Visão Geral já gerenciam seus loadings.

### `Dashboard.tsx` (linhas 37-39)
O Dashboard já usa `PageSkeleton variant="dashboard"`. Substituir por 4x `SkeletonCard variant="kpi"` dentro do layout existente do `DashboardSkeleton` em `PageSkeleton.tsx`, ou alterar diretamente o fallback no Dashboard.

**Abordagem escolhida**: Manter `PageSkeleton` para o Dashboard mas atualizar o `DashboardSkeleton` em `PageSkeleton.tsx` para usar `SkeletonCard` internamente (4x kpi + 1x chart), garantindo consistência visual.

## Arquivos
- **Novo**: `src/components/ui/SkeletonCard.tsx`
- **Editados**: `MentoriaEntregas.tsx`, `MentoriaSessoes.tsx`, `PageSkeleton.tsx`
