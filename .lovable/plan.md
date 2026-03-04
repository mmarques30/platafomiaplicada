

# Renomear planos Business no banco e frontend

## Resumo da mudanca
- `plano_mentoria = 'business'` → `'business_parceria'`
- `plano_mentoria = 'business_iaplicada'` → `'business_sistemas'`
- Role `mentorado` permanece no banco (sem alteracao em RLS)
- Frontend diferencia a view pelo valor de `plano_mentoria`

## Impacto

### Banco de dados (1 migration)
1. Recriar enum `plano_mentoria` com novos valores: `academy`, `skills`, `business_parceria`, `business_sistemas`
2. Migrar dados existentes (`business` → `business_parceria`, `business_iaplicada` → `business_sistemas`)
3. Atualizar todas as funcoes SQL que referenciam os valores antigos:
   - `calcular_prazo_sla` — referencia `business`, `business_iaplicada`
   - `user_has_access_level` — referencia `business`, `business_iaplicada`
   - `get_public_profiles` — retorna tipo `plano_mentoria`
   - `verificar_email_mentorado` — usa `plano_mentoria IS NOT NULL` (sem impacto)
   - `handle_new_user` — sem impacto (nao seta plano)
4. Atualizar enum `nivel_acesso_plano` **nao muda** (continua `academy`, `skills`, `business`)

### Frontend (~20 arquivos)
Substituir todas as referencias de string:
- `"business"` (como plano) → `"business_parceria"`
- `"business_iaplicada"` → `"business_sistemas"`

**Arquivos principais afetados:**

| Arquivo | O que muda |
|---------|-----------|
| `useUserPlan.tsx` | Tipo `UserPlan`, comparacoes, helpers `isBusinessColaborativo`/`isBusinessIAplicada` → `isBusinessParceria`/`isBusinessSistemas` |
| `useEffectivePlan` (mesmo arquivo) | Todas as comparacoes de plano e flags retornadas |
| `EnvironmentContext.tsx` | Tipo `Environment`, config, `availableEnvironments` |
| `AdminViewContext.tsx` | Tipo `AdminViewMode` |
| `EditUserModal.tsx` | Opcoes de plano, tipo do state |
| `GerenciarUsuarios.tsx` | Labels no filtro de plano |
| `CadastrarUsuario.tsx` | Opcoes de plano |
| `AppSidebar.tsx` | Deteccao `isBusinessIAplicadaEnv` |
| `EnvironmentSwitcher.tsx` | Lista de ambientes |
| `EnvironmentSelector.tsx` | Icones e imagens |
| `Mentoria.tsx` | Condicoes de tabs |
| `TopHeader.tsx` | Condicao `hasEffectiveAccessTo("business")` |
| `UserSelectorByPlanModal.tsx` | Tipo e filtros |
| `DistribuicaoPlanos.tsx` | Labels do grafico |
| `NovoUsuarioModal.tsx` | Opcoes de plano |
| `useSkillsLider.ts` | Condicao de acesso |

**Labels de exibicao:**
- `"Business"` → `"Business Parceria"`
- `"Business iAplicada"` → `"Business Sistemas"`

### Ordem de execucao
1. Migration SQL (renomear enum + atualizar funcoes)
2. Atualizar todos os arquivos frontend em sequencia
3. Testar fluxo completo

### Risco
- **Alto**: a migration precisa recriar o enum (Postgres nao permite renomear valores de enum). Isso exige: criar novo tipo, alterar coluna, dropar tipo antigo
- As funcoes SQL com `SECURITY DEFINER` precisam ser recriadas com os novos valores
- O `types.ts` sera regenerado automaticamente apos a migration

