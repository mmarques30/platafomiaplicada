

# Fluxo de primeiro acesso para Business

## Resumo
Adicionar mensagem de boas-vindas personalizada no cadastro admin de usuários Business, e exibir tela intermediária no primeiro login antes do Dashboard.

---

## 1. Nova coluna `mensagem_boas_vindas` na tabela `profiles`
**Migração SQL:**
```sql
ALTER TABLE public.profiles ADD COLUMN mensagem_boas_vindas TEXT DEFAULT NULL;
```

## 2. Campo textarea no painel admin
**Arquivo: `src/components/admin/NovoUsuarioModal.tsx`**
- Quando `selectedPlano` for `business_parceria` ou `business_sistemas`, exibir textarea "Mensagem de boas-vindas (opcional)" abaixo dos campos existentes
- Passar `mensagemBoasVindas` no `createUser.mutateAsync()`

**Arquivo: `src/hooks/admin/useUsers.tsx`**
- Adicionar `mensagemBoasVindas` ao `mutationFn` do `useCreateUser`, passando no body da edge function

**Arquivo: `supabase/functions/create-user-admin/index.ts`**
- Extrair `mensagemBoasVindas` do body
- Incluir `mensagem_boas_vindas` no `updateData` do profile

## 3. Tela intermediária de boas-vindas Business
**Novo arquivo: `src/pages/BusinessWelcome.tsx`**
- Tela fullscreen dark (estilo OnboardingWelcome)
- Título: "Bem-vindo à sua jornada, [nome]"
- Mensagem personalizada do admin (ou texto padrão: "Estamos preparando tudo para você...")
- 3 cards de ação: "Conheça suas etapas" → `/mentoria`, "Veja o roadmap" → `/mentoria` (aba roadmap), "Agende sua primeira sessão" → `/notificacoes/calendario`
- Botão "Entrar na plataforma" → atualiza `primeiro_acesso: false` + navega para `/`

## 4. Redirect automático no Dashboard
**Arquivo: `src/pages/Dashboard.tsx`**
- No bloco de `useMemo` / early return: se `profile.primeiro_acesso === true` e plano é `business_parceria` ou `business_sistemas`, redirecionar para `/business-welcome`

## 5. Rota
**Arquivo: `src/App.tsx`**
- Adicionar rota protegida `<Route path="/business-welcome" element={<ProtectedRoute><BusinessWelcome /></ProtectedRoute>} />`

## Arquivos
- **Migração SQL**: nova coluna `mensagem_boas_vindas`
- **Novo**: `src/pages/BusinessWelcome.tsx`
- **Editados**: `NovoUsuarioModal.tsx`, `useUsers.tsx`, `create-user-admin/index.ts`, `Dashboard.tsx`, `App.tsx`

