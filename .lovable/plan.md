

# Visualização do Método de Login no Painel Admin

## Objetivo

Adicionar uma coluna ou indicador visual na tabela de usuários do painel admin que mostre se cada usuário utiliza **Google** ou **Email/Senha** para fazer login.

## Como Funciona a Detecção

No Lovable Cloud, o método de login fica armazenado no campo `app_metadata.provider` da tabela `auth.users`:
- `google` = Login via Google OAuth
- `email` = Login via email/senha tradicional

Como a tabela `auth.users` é protegida, precisamos criar uma edge function para consultar essa informação.

## Alterações Necessárias

### 1. Nova Edge Function: `get-users-auth-providers`

Criar uma função que consulte o `app_metadata.provider` de todos os usuários:

```text
supabase/functions/get-users-auth-providers/index.ts
```

A função vai:
- Verificar se o solicitante é admin
- Usar `supabaseAdmin.auth.admin.listUsers()` para listar todos os usuários
- Retornar um mapa de `userId -> provider`

### 2. Novo Hook: `useUsersAuthProviders`

Criar um hook para consumir a edge function:

```text
src/hooks/admin/useUsersAuthProviders.tsx
```

### 3. Atualizar Página de Gerenciar Usuários

```text
src/pages/admin/GerenciarUsuarios.tsx
```

Adicionar:
- Nova coluna "Login" na tabela
- Badge visual indicando o método:
  - **Google**: Badge azul com ícone do Google
  - **Email**: Badge cinza com ícone de envelope

## Visual Final

| Nome | Email | ... | Login | Status | Ações |
|------|-------|-----|-------|--------|-------|
| João | joao@... | ... | 🔷 Google | Ativo | ✏️ 🗑️ |
| Maria | maria@... | ... | 📧 Email | Ativo | ✏️ 🗑️ |

## Arquivos a Criar/Modificar

1. `supabase/functions/get-users-auth-providers/index.ts` - Nova edge function
2. `src/hooks/admin/useUsersAuthProviders.tsx` - Novo hook
3. `src/pages/admin/GerenciarUsuarios.tsx` - Adicionar coluna na tabela

## Detalhes Técnicos

### Edge Function

```typescript
// Usa auth.admin.listUsers() que retorna app_metadata
const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

const providers: Record<string, string> = {}
users.forEach(user => {
  providers[user.id] = user.app_metadata?.provider || 'email'
})

return providers
```

### Badge Component

```tsx
{authProvider === 'google' ? (
  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
    <svg>...</svg> Google
  </Badge>
) : (
  <Badge variant="outline" className="text-muted-foreground">
    <Mail className="h-3 w-3 mr-1" /> Email
  </Badge>
)}
```

## Considerações de Performance

- A listagem de usuários do auth só é chamada uma vez por acesso à página
- O hook faz cache via React Query
- Para páginas com muitos usuários, a paginação do `listUsers()` será implementada

