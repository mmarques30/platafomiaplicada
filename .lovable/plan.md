
# Plano: Corrigir Visibilidade da Sala de Aula para Visitantes

## Problema Identificado

O hook `useEffectivePlan` tem um bug na linha 153 que faz visitantes serem marcados como `isAcademy = true`:

```typescript
// Linha 153 (BUG)
const effectiveIsAcademy = !effectiveIsBusiness && !effectiveIsSkills;
```

**Lógica atual para visitante:**
- `effectiveIsBusiness = false`
- `effectiveIsSkills = false`  
- `effectiveIsAcademy = !false && !false = true` ← ERRADO!

**Consequência:** No sidebar (linha 413), a condição `{!isAcademy && ...}` se torna `false`, ocultando o menu "Sala de Aula" para visitantes.

## Solução

Corrigir a lógica no hook `useEffectivePlan` para considerar que visitantes NÃO são Academy:

```typescript
// Correção: só é Academy se tiver plano Academy e não for visitante
const effectiveIsAcademy = !effectiveIsBusiness && !effectiveIsSkills && !effectiveIsVisitante && plan === 'academy';
```

Mas como `effectiveIsVisitante` depende de `isLoading`, precisamos ajustar a ordem de cálculo.

**Solução Correta:**

```typescript
// Linha 150-157 - CORRIGIR PARA:

// Visitante real: flag do profile OU não tem plano (sem ser admin)
// IMPORTANTE: Durante loading, não marcar como visitante para evitar redirect prematuro
const effectiveIsVisitante = isLoading ? false : (isRealVisitante || (!isAdmin && !plan));

// Sem simulação: flags de plano (só se não for visitante)
const effectiveIsBusiness = isAdmin || isBusiness;
const effectiveIsSkills = !effectiveIsBusiness && isSkills;
// Corrigir: visitantes NÃO são Academy
const effectiveIsAcademy = !effectiveIsBusiness && !effectiveIsSkills && !effectiveIsVisitante && isAcademy;
```

A mudança-chave é adicionar `&& !effectiveIsVisitante && isAcademy` na condição de `effectiveIsAcademy`, garantindo que:
1. Visitantes não sejam marcados como Academy
2. Só marca como Academy se o plano real for "academy"

---

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useUserPlan.tsx` | Corrigir lógica de `effectiveIsAcademy` para não incluir visitantes |

---

## Resultado Esperado

| Tipo de Usuário | isAcademy | Menu "Sala de Aula" |
|-----------------|-----------|---------------------|
| **Visitante** | `false` | Visível |
| **Academy** | `true` | Oculto |
| **Skills** | `false` | Visível |
| **Business** | `false` | Menu Comunidade oculto |
| **Admin** | `false` | Visível (como Business) |

Com essa correção, visitantes poderão ver e acessar a Sala de Aula normalmente.
