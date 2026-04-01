

# Condicionar OnboardingVideo para não renderizar para Business

## Alteração

**Arquivo**: `src/components/layout/MainLayout.tsx`

1. Adicionar import de `useEffectivePlan` do `@/hooks/useUserPlan`
2. Dentro do componente, após os hooks existentes, adicionar:
   ```
   const { effectivePlan } = useEffectivePlan(isAdmin, isLoading);
   const isBusinessPlan = effectivePlan === 'business_parceria' || effectivePlan === 'business_sistemas';
   ```
3. Linha 69: substituir `<OnboardingVideo />` por `{!isBusinessPlan && <OnboardingVideo />}`

Nenhuma outra alteração.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/MainLayout.tsx` | Editado — condicional Business no OnboardingVideo |

