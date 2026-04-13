

# Fix: Exclusão de usuários bloqueada por foreign keys

## Problema

O erro "Database error deleting user" acontece porque duas tabelas têm foreign keys para `auth.users` **sem `ON DELETE CASCADE`**. Quando o Supabase tenta deletar o usuário, o PostgreSQL bloqueia porque existem registros referenciando esse user.

Tabelas com problema:
- `notas_projeto_business.created_by` → sem ON DELETE
- `webhook_lia_logs.user_created_id` → sem ON DELETE

## Correção

Uma migration SQL para alterar as duas foreign keys, adicionando `ON DELETE SET NULL`:

```sql
ALTER TABLE notas_projeto_business
  DROP CONSTRAINT notas_projeto_business_created_by_fkey,
  ADD CONSTRAINT notas_projeto_business_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE webhook_lia_logs
  DROP CONSTRAINT webhook_lia_logs_user_created_id_fkey,
  ADD CONSTRAINT webhook_lia_logs_user_created_id_fkey
    FOREIGN KEY (user_created_id) REFERENCES auth.users(id) ON DELETE SET NULL;
```

Usamos `SET NULL` ao invés de `CASCADE` para preservar os registros de notas e logs mesmo após exclusão do usuário.

Nenhuma alteração de código é necessária - apenas a migration no banco.

