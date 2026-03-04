

# Adicionar role "Equipe" no EditUserModal

## Problema
O `EditUserModal.tsx` define `AppRole` sem `"equipe"`, por isso nao aparece o checkbox na aba Acesso.

## Alteracoes

**Arquivo:** `src/components/admin/EditUserModal.tsx`

1. Alterar tipo: `type AppRole = "admin" | "equipe" | "mentorado" | "aluno_trilha" | "parceiros";`
2. Adicionar checkbox "Equipe" na lista de permissoes (entre Administrador e Mentorado)

