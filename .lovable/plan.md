
# Corrigir Acesso Admin e Membros a Todas as Abas do Skills

## Problema Raiz

Todas as paginas de submenus Skills (Avaliacao, Projetos, Performance) dependem do hook `useSkillsMembro` para obter o `equipeId`. Quando o usuario nao e membro direto de uma equipe Skills (como o admin), `equipeId` retorna `null` e as paginas redirecionam para `/skills/projeto` (Visao Geral).

O hook `useSkillsLider` ja resolve isso com um "admin fallback" que busca a primeira equipe disponivel, mas as paginas de Diagnostico e Projetos nao usam esse hook — usam `useSkillsMembro` diretamente.

## Solucao

Mover a logica de admin fallback para dentro do `useSkillsMembro`, eliminando o problema na raiz. Assim, TODAS as paginas que dependem desse hook funcionarao automaticamente para admins, membros e simulacoes.

### Arquivo: `src/hooks/useSkillsMembro.ts`

Adicionar uma segunda query que busca a primeira equipe disponivel quando o usuario e admin e nao tem equipe propria:

```typescript
// Fallback para admin: buscar primeira equipe disponivel
const { data: fallbackEquipe, isLoading: fallbackLoading } = useQuery({
  queryKey: ["skills-admin-fallback-equipe"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("equipes_skills")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  },
  enabled: isAdmin && !data?.equipe_id && !isPending && !authLoading && !roleLoading,
});

// equipeId final: do membro OU fallback admin
const finalEquipeId = data?.equipe_id ?? (isAdmin ? fallbackEquipe : null);

// isLoading inclui fallback quando admin sem equipe
const adminWaitingFallback = isAdmin && !data?.equipe_id && !isPending && !fallbackLoading === false;

return {
  equipeId: finalEquipeId,
  // ... demais campos
  isLoading: isPending || authLoading || roleLoading || (isAdmin && !data?.equipe_id && fallbackLoading),
};
```

### Arquivo: `src/hooks/useSkillsLider.ts`

Remover a logica duplicada de admin fallback (linhas 86-101), pois agora `useSkillsMembro` ja fornece o `equipeId` correto para admins. Usar `membroEquipeId` diretamente em vez de `equipeId = membroEquipeId || adminFallbackEquipeId`.

### Paginas afetadas (sem alteracao necessaria)

Estas paginas continuam usando `useSkillsMembro` normalmente e funcionarao sem mudancas:
- `ProjetoSkillsDiagnosticoPage.tsx` — usa `equipeId` de `useSkillsMembro`
- `ProjetoSkillsProjetosPage.tsx` — usa `equipeId` de `useSkillsMembro`
- `ProjetoSkillsPerformancePage.tsx` — usa `SkillsAdminGuard` + `useSkillsLider`
- `SkillsAdminGuard.tsx` — usa `isAdmin` de `useUserRole` (sem mudanca)

## Resultado

- **Admin sem simulacao**: fallback busca primeira equipe, `equipeId` nao e null, paginas carregam normalmente
- **Admin com simulacao**: `effectiveUserId` aponta para usuario simulado, query retorna equipe do usuario simulado, ou fallback se necessario
- **Membros normais**: query retorna equipe propria, sem mudanca no comportamento
- **Lideres**: idem membros, com papel "lider"
- Elimina a logica duplicada em `useSkillsLider`
