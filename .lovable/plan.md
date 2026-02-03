
# Correção: Login com Google para Qualquer Email Cadastrado

## Problema Identificado

A lógica atual na edge function `verificar-google-login` verifica se o email é `@gmail.com` ou `@googlemail.com` para permitir o login. Porém, o usuário quer que **qualquer pessoa já cadastrada** possa usar o Google Login, independente do domínio do email.

## Nova Regra de Negócio Simplificada

| Situação | Resultado |
|----------|-----------|
| Email não cadastrado | Bloquear (deve usar formulário) |
| Email cadastrado (qualquer domínio) | Permitir Google Login |

## Alterações Necessárias

### 1. Simplificar Edge Function

**Arquivo:** `supabase/functions/verificar-google-login/index.ts`

A lógica será drasticamente simplificada:
- Remover a função `isGoogleEmail()`
- Remover verificações de `is_visitante` e `google_login_autorizado`
- Apenas verificar se o email existe na base de dados

```typescript
// Nova lógica simplificada:
if (!profile) {
  return { permitido: false, motivo: "novo_usuario" }
}
return { permitido: true }
```

### 2. Corrigir Estilo do Botão Cancelar

**Arquivo:** `src/components/auth/GoogleLoginVerificationModal.tsx`

Adicionar fundo escuro ao botão para torná-lo visível:
- De: `className="flex-1 border-white/10 text-white hover:bg-zinc-800"`
- Para: `className="flex-1 bg-zinc-800 border-white/10 text-white hover:bg-zinc-700"`

### 3. Manter ou Remover Campo `google_login_autorizado`?

Como a nova regra permite qualquer email cadastrado, o campo `google_login_autorizado` na tabela `profiles` e o toggle no painel admin não são mais necessários. Porém, recomendo **manter** por enquanto para evitar erros de migração e possibilitar voltar à regra anterior se necessário.

## Arquivos a Modificar

1. `supabase/functions/verificar-google-login/index.ts` - Simplificar lógica de validação
2. `src/components/auth/GoogleLoginVerificationModal.tsx` - Corrigir estilo do botão

## Resultado Esperado

- Qualquer usuário já cadastrado (mentorado ou visitante, qualquer domínio) pode usar Google Login
- Novos usuários continuam sendo direcionados para o formulário de cadastro
- Botão "Cancelar" ficará visível com fundo escuro
