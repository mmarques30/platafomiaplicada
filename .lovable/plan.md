
# Correção: Painel do Líder em Branco para Livia

## Causa Raiz Identificada

O problema é uma **condição de corrida (race condition)** no carregamento dos dados de autenticação.

### Sequência do bug:

```text
1. Página carrega
2. useAuth() inicia → user = null, loading = true
3. useSkillsMembro() → effectiveUserId = null → query DESABILITADA → isLoading = FALSE
4. useSkillsLider() → membroLoading = false, isLider = false → isLoading = FALSE, canAccess = FALSE
5. SquadLiderPainel → !isLoading && !canAccess → REDIRECIONA para /skills/equipe
6. Auth termina de carregar, mas já é tarde: o usuário já foi redirecionado
```

O hook `useSkillsMembro` usa `useAuth()` mas **não inclui o estado de loading da autenticação** no seu retorno. Quando a query do TanStack Query está desabilitada (`enabled: false`), o `isLoading` retornado é `false`, não `true`. Isso faz o painel pensar que os dados já carregaram e que o usuário não tem acesso.

## Solução

### 1. Corrigir `useSkillsMembro.ts`

Incluir o loading da autenticação e do role no `isLoading` retornado:

```typescript
const { user, loading: authLoading } = useAuth();
const { isAdmin, isLoading: roleLoading } = useUserRole();

// ...

return {
  // ...
  isLoading: isLoading || authLoading || roleLoading,
};
```

Isso garante que enquanto a autenticação não terminar, `membroLoading` será `true`, impedindo o redirect prematuro.

### 2. Verificar `useSkillsLider.ts`

Confirmar que `membroLoading` agora inclui o auth loading, e que `isLoading` geral continua correto. Nenhuma mudança adicional necessária aqui, pois o `membroLoading` já está na composição de `isLoading`.

### 3. Melhorar `SquadLiderPainel.tsx`

Adicionar uma verificação extra de segurança no redirect:

```typescript
useEffect(() => {
  // Só redirecionar se realmente temos certeza que não pode acessar
  // (auth carregou, role carregou, membro carregou)
  if (!isLoading && !canAccess) {
    navigate("/skills/equipe");
  }
}, [isLoading, canAccess, navigate]);
```

Com o fix no `useSkillsMembro`, o `isLoading` agora será `true` até a autenticação terminar, então o redirect não vai disparar prematuramente.

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useSkillsMembro.ts` | Incluir `authLoading` e `roleLoading` no isLoading |

## Resultado Esperado

- Livia (e qualquer líder) verá o Painel do Líder completo em `/squad/lider`
- O redirect para `/skills/equipe` só acontece APÓS confirmar que o usuário realmente não tem acesso
- Admin em simulação continua funcionando
- Estrutura do dashboard (KPIs, cronograma, gráficos, ranking, ROI) sempre visível com estados vazios informativos
