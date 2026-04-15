

## Diagnóstico

A tabela `conteudos_dashboard` tem apenas 37 linhas — a query é instantânea no banco. O problema não é de banco nem de CORS.

A causa é que os hooks `useConteudosDashboard` e `useMateriaisGratuitos` não definem `staleTime`, então o React Query trata os dados como "stale" imediatamente e **refaz o fetch toda vez** que:
- O componente monta
- A aba do navegador volta ao foco
- O usuário navega e volta ao Dashboard

Isso gera um flash de skeleton/loading a cada visita, dando a impressão de lentidão.

## Correção

Adicionar `staleTime` e `gcTime` (garbage collection) nos dois hooks para que os dados fiquem em cache por 5 minutos, eliminando refetches desnecessários:

### 1. `src/hooks/useConteudosDashboard.tsx`
Adicionar ao `useQuery`:
```ts
staleTime: 5 * 60 * 1000,  // 5 min — dados não mudam a cada segundo
gcTime: 10 * 60 * 1000,
```

### 2. `src/hooks/useConteudosDashboardGratuito.tsx`
Mesmo ajuste.

### 3. `src/hooks/useMateriaisGratuitos.tsx`
Mesmo ajuste.

Nenhuma migration de banco necessária. Apenas 3 arquivos editados, uma linha em cada.

