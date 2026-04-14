

## Problema

A edge function `create-user-admin` tem o mesmo bug do `webhook-lia-compra`: usa `listUsers()` (limite 1000) para buscar usuários existentes quando o email já está cadastrado. Além disso, a comparação é case-sensitive (`===` ao invés de `.toLowerCase()`), o que causa falha quando o email digitado tem capitalização diferente.

O erro nos logs confirma: `"Email existe mas usuário não encontrado"` para `Luciane.correia@gmail.com`.

## Correção

**Arquivo**: `supabase/functions/create-user-admin/index.ts` (linhas 104-109)

Substituir o bloco `listUsers()` por busca direta na tabela `profiles`:

```typescript
// ANTES (bugado):
const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
const existingUser = listData.users.find(u => u.email === email)
if (!existingUser) throw new Error('Email existe mas usuário não encontrado')
userId = existingUser.id

// DEPOIS (corrigido):
const { data: profileData } = await supabaseAdmin
  .from('profiles')
  .select('id')
  .eq('email', email.toLowerCase())
  .maybeSingle()

if (profileData) {
  userId = profileData.id
} else {
  // Fallback: listUsers com comparação case-insensitive
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = listData?.users.find(
    u => u.email?.toLowerCase() === email.toLowerCase()
  )
  if (!existingUser) throw new Error('Email existe mas usuário não encontrado no auth nem em profiles')
  userId = existingUser.id
}
```

Depois do fix, re-deploy da function.

## Resultado esperado

Criar/promover usuários existentes funcionará independentemente do número total de usuários no sistema e da capitalização do email.

