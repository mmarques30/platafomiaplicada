
# Corrigir Bug de Race Condition no Fallback Admin do Skills

## Problema

Quando qualquer usuario (admin, membro, ou simulacao) tenta navegar para "Avaliacao", "Projetos" ou "Performance", a pagina redireciona de volta para "Visao Geral". O problema persiste apesar das correcoes anteriores.

## Causa Raiz

Ha um bug sutil na query de fallback do `useSkillsMembro`. Quando `needsFallback` muda de `false` para `true` (no momento que as roles carregam), existe **um frame de renderizacao** onde:

1. A query de fallback acaba de ser habilitada (`enabled` mudou para `true`)
2. Mas o React Query ainda nao iniciou o fetch
3. `isLoading` (que e `isPending && isFetching`) retorna `false` porque o fetch nao comecou
4. `fallbackEquipeId` e `null` (sem dados ainda)
5. Resultado: `isLoading = false` e `equipeId = null` por um frame
6. O `useEffect` das paginas detecta `!isLoading && !equipeId` e redireciona

## Solucao

Trocar `isLoading` por `isPending` na query de fallback. No React Query v5:
- `isLoading` = `isPending && isFetching` (false quando query esta desabilitada ou acabou de ser habilitada)
- `isPending` = `true` sempre que nao ha dados em cache (inclusive em queries desabilitadas)

Isso elimina o frame onde a query esta habilitada mas sem dados e sem estar "carregando".

### Arquivo: `src/hooks/useSkillsMembro.ts`

Alteracao na desestruturacao da query de fallback:

```typescript
// ANTES:
const { data: fallbackEquipeId, isLoading: fallbackLoading } = useQuery({...});

// DEPOIS:
const { data: fallbackEquipeId, isPending: fallbackPending } = useQuery({...});
```

E no calculo de isLoading:

```typescript
// ANTES:
const isLoading = isPending || authLoading || roleLoading || (needsFallback && fallbackLoading);

// DEPOIS:
const isLoading = isPending || authLoading || roleLoading || (needsFallback && fallbackPending);
```

## Por que isso funciona

- Quando `needsFallback` era `false` e muda para `true`: `isPending` ja e `true` (nao ha dados em cache), entao `isLoading` permanece `true` ate o fetch completar
- Quando o fetch completa: `isPending` vira `false`, `fallbackEquipeId` tem o valor correto
- Para membros normais: `needsFallback` e sempre `false`, sem impacto
- Para simulacoes: a logica de `shouldQuery` e `effectiveUserId` continua funcionando normalmente

## Resultado

- Nenhum frame intermediario com `isLoading = false` e `equipeId = null`
- Admin sem simulacao: fallback completa antes de `isLoading = false`, paginas carregam
- Admin com simulacao: query espera roles, usa ID correto
- Membros: comportamento inalterado
