

# Correções no fluxo de autenticação

## Problema atual
1. **Após login**: sempre redireciona para `/selecionar-ambiente`, mesmo que o usuário já tenha selecionado antes
2. **`/selecionar-ambiente` sem auth**: se o usuário não está autenticado, `useUserPlan` e `useUserRole` nunca resolvem → spinner infinito
3. **Botão Google ausente no signup**: só existe no `LoginForm`, não no `SignupForm`

## Correções

### 1. Redirecionar direto ao Dashboard se ambiente já salvo
**Arquivo: `src/pages/Auth.tsx`**
- Mudar o redirect de `/selecionar-ambiente` para checagem: se `sessionStorage.getItem("selected_environment")` existe, ir para `/` (dashboard); senão, ir para `/selecionar-ambiente`

### 2. Proteger `/selecionar-ambiente` contra acesso sem auth
**Arquivo: `src/pages/EnvironmentSelector.tsx`**
- Importar `useAuth` e verificar `user` e `loading`
- Se `!loading && !user`, redirecionar para `/auth`
- Mostrar spinner apenas enquanto `loading` do auth for `true`

### 3. Botão Google na aba Criar Conta
**Arquivo: `src/components/auth/SignupForm.tsx`**
- Adicionar divisor "ou" + `GoogleLoginButton` + `GoogleLoginVerificationModal` após o botão "Criar conta grátis", igual ao `LoginForm`

## Arquivos alterados
- `src/pages/Auth.tsx` (1 linha de redirect)
- `src/pages/EnvironmentSelector.tsx` (adicionar guard de auth ~10 linhas)
- `src/components/auth/SignupForm.tsx` (adicionar Google button + modal)

