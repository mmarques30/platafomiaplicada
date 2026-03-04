

# Criar role "parceiros" com visao Business

## Resumo

Adicionar o tipo de usuario `parceiros` ao sistema. Parceiros terao uma role propria no banco e verao a plataforma com a mesma interface do plano Business. Na gestao administrativa, aparecerao junto com os usuarios Business, identificados por um badge "Parceiro".

## Alteracoes

### 1. Migracao SQL
- Adicionar `parceiros` ao enum `app_role`

### 2. Hooks — acesso e plano
| Arquivo | Mudanca |
|---|---|
| `src/hooks/useUserRole.tsx` | Adicionar `isParceiro` ao retorno; incluir parceiros em `hasAccess` |
| `src/hooks/useUserPlan.tsx` | Em `useUserPlan`: se usuario tem role `parceiros` e nao tem `plano_mentoria`, tratar como business. Em `useEffectivePlan`: parceiros verao visao business |

### 3. Modais de admin (role selection)
| Arquivo | Mudanca |
|---|---|
| `src/components/admin/NovoUsuarioModal.tsx` | Adicionar checkbox "Parceiro" nas roles |
| `src/components/admin/UserRoleModal.tsx` | Adicionar "Parceiro" em AVAILABLE_ROLES |
| `src/components/admin/EditUserModal.tsx` | Adicionar "Parceiro" na lista de roles |
| `src/hooks/admin/useUsers.tsx` | Incluir `parceiros` no tipo AppRole |

### 4. Gestao Business — incluir parceiros
| Arquivo | Mudanca |
|---|---|
| `src/pages/admin/mentoria/MentoriaBusinessPage.tsx` | Alterar filtro de usuarios: incluir quem tem role `parceiros`. Exibir badge "Parceiro" ao lado do nome |
| `src/pages/admin/GerenciarUsuarios.tsx` | Exibir badge "Parceiro" quando user tem role parceiros |

### 5. Edge function
| Arquivo | Mudanca |
|---|---|
| `supabase/functions/create-user-admin/index.ts` | Aceitar `parceiros` como role valida. Quando role inclui `parceiros`, setar `plano_mentoria = 'business'` automaticamente se nenhum plano foi selecionado |

### 6. Exportacao CSV
| Arquivo | Mudanca |
|---|---|
| `src/lib/exportUsers.ts` | Nenhuma — roles ja sao exportadas dinamicamente |

