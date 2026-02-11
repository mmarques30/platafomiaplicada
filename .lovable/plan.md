
# Corrigir Navegacao entre Submenus Skills durante Simulacao

## Problema

Quando o admin simula um usuario (como Erich) e tenta navegar para "Avaliacao" ou "Projetos", a pagina trava e volta para "Visao Geral". Isso acontece porque:

1. O hook `useSkillsMembro` tem uma **condicao de corrida (race condition)**: enquanto `useUserRole` ainda esta carregando, `isAdmin` e `false`, entao `effectiveUserId` usa o ID do admin em vez do ID do Erich
2. A query dispara com o ID do admin, que nao e membro de nenhuma equipe Skills, e retorna `null`
3. `isPending` fica `false` (a query completou), mas `roleLoading` ainda e `true`, entao `isLoading` continua `true` -- ate aqui tudo bem
4. Quando `roleLoading` vira `false`, `isAdmin` vira `true`, `effectiveUserId` muda para o ID do Erich, e uma **nova query** e disparada
5. Porem, entre a primeira query completar e a segunda iniciar, ha um momento em que `isPending` e `false` e `roleLoading` e `false`, mas `data` ainda e `null` (resultado da query antiga com ID do admin)
6. Nesse instante, `isLoading = false` e `equipeId = null`, ativando o redirect para `/skills/projeto`

## Solucao

Modificar `useSkillsMembro` para **nao disparar a query enquanto as roles estao carregando e ha uma simulacao ativa**. Isso garante que `effectiveUserId` seja resolvido corretamente antes de qualquer consulta.

### Arquivo: `src/hooks/useSkillsMembro.ts`

Adicionar a condicao `!roleLoading` ao `enabled` quando ha simulacao:

```typescript
// A query so deve disparar quando:
// 1. Temos um effectiveUserId valido
// 2. Se ha simulacao ativa, as roles ja devem ter carregado
const shouldQuery = !!effectiveUserId && (!isViewingAs || !roleLoading);

const { data, isPending } = useQuery({
  queryKey: ["skills-membro", effectiveUserId],
  queryFn: async () => {
    if (!effectiveUserId) return null;
    const { data, error } = await supabase
      .from("membros_equipe_skills")
      .select("equipe_id, papel, cargo, status")
      .eq("user_id", effectiveUserId)
      .eq("status", "ativo")
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  enabled: shouldQuery,
});
```

## Detalhes Tecnicos

- Quando `isViewingAs` e `true` e `roleLoading` e `true`, `enabled` sera `false`, impedindo a query prematura
- Quando `roleLoading` resolver, `isAdmin` sera `true`, `effectiveUserId` sera o ID do Erich, e a query disparara com o ID correto
- Quando nao ha simulacao (`isViewingAs = false`), o comportamento permanece identico ao atual
- A RLS funciona corretamente pois o admin tem a policy "ALL" que permite ler qualquer registro

## Resultado

- Admin simulando Erich: query espera as roles carregarem, usa o ID do Erich, retorna `equipeId` correto, permite navegar para Avaliacao/Projetos
- Admin sem simulacao: comportamento inalterado
- Membros normais: comportamento inalterado (nunca passam por `isViewingAs`)
