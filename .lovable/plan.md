
# Correcao Definitiva dos Bugs do Ambiente Skills

## Problema Raiz Identificado

Ao navegar para "Avaliacao" ou "Projetos", o componente `ProjetoSkillsDiagnosticoPage` (e `ProjetoSkillsProjetosPage`) executa:

```text
if (isLoading) -> spinner
if (!equipeId) -> Navigate to /skills/projeto  <-- REDIRECT PREMATURO
```

O problema esta em como `isLoading` e calculado no `useSkillsMembro`. Em React Query v5:

- `isLoading` (da query) = `isPending && isFetching` = FALSE quando a query esta desabilitada
- `isPending` (da query) = TRUE quando a query esta desabilitada

O hook `useUserRole` retorna `isLoading` (nao `isPending`), entao quando a query de roles esta desabilitada (user ainda null), `roleLoading` = false prematuramente. Combinado com o fato de que o query key muda quando `isAdmin` transita de false para true, ha um frame onde `isLoading` = false mas `equipeId` = null, disparando o `<Navigate>`.

Alem disso, confirmei via rede que os dados retornam corretamente (equipes_skills retorna o ID da equipe no fallback admin), mas o redirect ja aconteceu antes.

## Solucao em 3 Partes

### 1. Corrigir `useUserRole` para retornar `isPending` em vez de `isLoading`

**Arquivo:** `src/hooks/useUserRole.tsx`

Mudar a desestruturacao da query para usar `isPending` em vez de `isLoading`, garantindo que o estado de carregamento seja true enquanto nao houver dados (mesmo com query desabilitada):

```typescript
// ANTES:
const { data: roles, isLoading } = useQuery({...});
// ...
return { ..., isLoading };

// DEPOIS:
const { data: roles, isPending } = useQuery({...});
// ...
return { ..., isLoading: isPending };
```

### 2. Proteger `useSkillsMembro` contra transicoes de query key

**Arquivo:** `src/hooks/useSkillsMembro.ts`

Adicionar uma verificacao extra no `isLoading` para cobrir o caso em que `isAdmin` pode mudar o query key:

```typescript
// ANTES:
const isLoading = isPending || authLoading || roleLoading;

// DEPOIS:
const isLoading = isPending || authLoading || roleLoading || (!data && !authLoading);
```

A condicao `(!data && !authLoading)` garante que `isLoading` permaneca true ate que a query retorne dados, mesmo durante transicoes de query key.

### 3. Substituir `Navigate` declarativo por redirecionamento imperativo com delay

**Arquivos:** `src/pages/skills/ProjetoSkillsDiagnosticoPage.tsx` e `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

Trocar o `<Navigate>` declarativo (que dispara imediatamente no render) por `useEffect` + `navigate()` com uma verificacao dupla:

```typescript
// ANTES:
if (!equipeId) return <Navigate to="/skills/projeto" replace />;

// DEPOIS:
useEffect(() => {
  if (!isLoading && !equipeId) {
    navigate("/skills/projeto", { replace: true });
  }
}, [isLoading, equipeId, navigate]);

if (!equipeId) {
  return <LoadingSpinner />;  // Mostra spinner enquanto aguarda redirect ou dados
}
```

Isso garante que o componente nunca redirecione prematuramente - ele mostra um spinner e so redireciona quando tem certeza absoluta de que nao ha equipe disponivel.

### 4. Incrementar cache PWA para v14

**Arquivo:** `vite.config.ts`

Incrementar as versoes de cache de v13 para v14 para garantir que a correcao chegue na producao apos publicar.

## Resumo das alteracoes

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useUserRole.tsx` | Usar `isPending` em vez de `isLoading` da query |
| `src/hooks/useSkillsMembro.ts` | Adicionar guard `(!data && !authLoading)` no isLoading |
| `src/pages/skills/ProjetoSkillsDiagnosticoPage.tsx` | Trocar `Navigate` por `useEffect` + navigate com spinner fallback |
| `src/pages/skills/ProjetoSkillsProjetosPage.tsx` | Mesma correcao do diagnostico |
| `vite.config.ts` | Cache v13 para v14 |

## Por que esta correcao e definitiva

As tentativas anteriores focaram em `useSkillsDiagnostico` e no componente `ProjetoSkillsDiagnostico`. O problema real esta uma camada acima - nas PAGES que guardam o acesso (`ProjetoSkillsDiagnosticoPage` e `ProjetoSkillsProjetosPage`) e no `useUserRole` que retorna um estado de loading incorreto em React Query v5. Esta correcao ataca a causa raiz em vez dos sintomas.

## Instrucao pos-implementacao

Apos aprovar e implementar: publicar o app. Os usuarios precisarao fechar e reabrir o app para carregar o cache v14.
