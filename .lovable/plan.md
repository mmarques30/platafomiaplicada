
# Plano: Corrigir Botão "Contribuir" Aparecendo para Visitantes

## Problema Identificado

O botão "Contribuir" está aparecendo para usuários visitantes (gratuitos) na aba "Criadores" da Central de Conteúdo. De acordo com a captura de tela, um usuário com `is_visitante = true` no banco de dados está vendo o botão quando não deveria.

## Análise da Causa Raiz

A lógica atual em `CriadoresComunidadeTab.tsx` (linhas 41 e 55):

```tsx
const { isVisitante, isLoading: isPlanLoading } = useUserPlan();
const canContribute = !isPlanLoading && !isVisitante;
```

O problema é uma **condição de corrida (race condition)**:
1. Quando `isPlanLoading` se torna `false`, o React Query pode ainda não ter os dados corretos
2. O `isVisitante` retorna `false` por padrão (`data?.isVisitante ?? false`) antes dos dados serem carregados
3. Isso resulta em `canContribute = true` brevemente

## Solução

Inverter a lógica para que o botão **só apareça quando tivermos certeza de que o usuário NÃO é visitante**:

1. Durante o loading: **não mostrar o botão** (já funciona)
2. Após o loading: **só mostrar se `isVisitante` for explicitamente `false`**

A correção mais segura é: durante o loading, `canContribute` deve ser `false`. Após o loading, verificar se `isVisitante` é `false` E se temos dados válidos do usuário.

## Arquivo a Modificar

**`src/components/comunidade/CriadoresComunidadeTab.tsx`**

### Antes (linha 52-55)
```tsx
// Mentorados (não visitantes) podem contribuir.
// Alguns perfis podem estar temporariamente sem plano_mentoria preenchido,
// então aqui a regra principal é "não ser visitante".
const canContribute = !isPlanLoading && !isVisitante;
```

### Depois
```tsx
// Mentorados (não visitantes) podem contribuir.
// IMPORTANTE: Durante o loading, canContribute é false para evitar flash do botão.
// Só mostramos o botão quando temos certeza que o usuário NÃO é visitante.
const canContribute = !isPlanLoading && isVisitante === false;
```

**Observação**: A mudança de `!isVisitante` para `isVisitante === false` é sutil mas importante:
- `!isVisitante` retorna `true` quando `isVisitante` é `false`, `undefined`, `null`, ou `0`
- `isVisitante === false` retorna `true` **apenas** quando `isVisitante` é explicitamente `false`

Porém, como o hook retorna `isVisitante: isProfileVisitante` e `isProfileVisitante` é `data?.isVisitante ?? false`, o valor será sempre `boolean`, nunca `undefined`.

A abordagem mais robusta é garantir que não renderizamos o botão enquanto estamos em loading, o que já está coberto por `!isPlanLoading`. O verdadeiro problema pode ser que o `isPlanLoading` está retornando `false` antes do `isVisitante` ser determinado.

### Solução Alternativa Mais Robusta

Verificar também se há um usuário autenticado e se os dados foram carregados:

```tsx
// Importar useAuth
import { useAuth } from "@/hooks/useAuth";

// No componente
const { user } = useAuth();
const { isVisitante, isLoading: isPlanLoading } = useUserPlan();

// Mentorados (não visitantes) podem contribuir.
// Só mostramos o botão quando:
// 1. Há um usuário autenticado
// 2. O loading terminou
// 3. O usuário NÃO é visitante
const canContribute = !!user && !isPlanLoading && !isVisitante;
```

## Comportamento Esperado

| Estado | `isPlanLoading` | `isVisitante` | `canContribute` | Botão |
|--------|-----------------|---------------|-----------------|-------|
| Carregando | `true` | `false` (padrão) | `false` | Oculto |
| Visitante logado | `false` | `true` | `false` | Oculto |
| Mentorado logado | `false` | `false` | `true` | Visível |
