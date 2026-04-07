

# Fix: Avisos não aparecem — mismatch entre tiers

## Problema
O `AvisoModal` salva `visivel_para` com o valor `"business"`, mas o hook `useAvisosPublicos` filtra usando `effectivePlan`, que para admins retorna `"business_parceria"` e para usuários business retorna `"business_parceria"` ou `"business_sistemas"`. O filtro `.contains("visivel_para", ["business_parceria"])` não encontra `"business"` no array, então o aviso não aparece.

## Solução
Ajustar o `useAvisosPublicos` para normalizar o `userTier` antes de filtrar: se o plano efetivo contém `"business"`, usar `"business"` como tier (que é o valor salvo pelo modal).

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/hooks/useAvisosPublicos.tsx` | Editar |

## Detalhes

Nas linhas 11 e 35, onde `userTier` é calculado, adicionar normalização:

```tsx
// De:
const userTier = isVisitante ? 'visitante' : (effectivePlan || 'academy');

// Para:
const rawTier = isVisitante ? 'visitante' : (effectivePlan || 'academy');
const userTier = rawTier?.startsWith('business') ? 'business' : rawTier;
```

Isso garante que tanto `business_parceria` quanto `business_sistemas` sejam mapeados para `"business"`, que é o valor usado no `AvisoModal`. A mesma correção se aplica nas duas ocorrências (linha 11 para `useAvisosPublicos` e linha 35 para `useAvisosAtivosCount`).

