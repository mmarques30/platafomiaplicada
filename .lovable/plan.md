

# Integrar OnboardingVideo no MainLayout

## Alteração

**Arquivo**: `src/components/layout/MainLayout.tsx`

1. Adicionar import no topo: `import { OnboardingVideo } from '@/components/onboarding/OnboardingVideo';`
2. Envolver o return em `<>...</>` e adicionar `<OnboardingVideo />` antes do `<SidebarProvider>`

Nenhum outro arquivo alterado.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/MainLayout.tsx` | Editado — import + inserção do OnboardingVideo |

