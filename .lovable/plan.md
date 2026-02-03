
# Correção: Erro 404 após Login com Google

## Problema Identificado

Após o Google OAuth retornar, o usuário vê uma página 404. Isso acontece porque:

1. O `redirect_uri` está configurado como `window.location.origin` (raiz `/`)
2. A raiz `/` é uma rota protegida que requer autenticação
3. Quando o OAuth retorna com tokens na URL, pode haver um momento onde a sessão ainda não foi processada
4. Se houver parâmetros não reconhecidos na URL, o React Router pode tratar como rota inexistente

## Solução

Alterar o `redirect_uri` para apontar para a página de autenticação (`/auth`) em vez da raiz. A página `/auth` já tem lógica para:
- Processar o retorno do OAuth
- Detectar se o usuário está autenticado via `useAuth`
- Redirecionar automaticamente para `/selecionar-ambiente` quando logado

## Alteração Necessária

### Arquivo: `src/components/auth/GoogleLoginVerificationModal.tsx`

**Linha 67-69:** Alterar o `redirect_uri`:

```typescript
// De:
const { error: oauthError } = await lovable.auth.signInWithOAuth("google", {
  redirect_uri: window.location.origin,
});

// Para:
const { error: oauthError } = await lovable.auth.signInWithOAuth("google", {
  redirect_uri: `${window.location.origin}/auth`,
});
```

## Fluxo Corrigido

```text
┌──────────────┐      ┌─────────────┐      ┌──────────────┐      ┌───────────────────┐
│  Usuário     │ ───▶ │   Google    │ ───▶ │   /auth      │ ───▶ │ /selecionar-      │
│  clica       │      │   OAuth     │      │   (processa  │      │  ambiente         │
│  "Google"    │      │   consent   │      │   callback)  │      │                   │
└──────────────┘      └─────────────┘      └──────────────┘      └───────────────────┘
```

## Arquivos Afetados

- `src/components/auth/GoogleLoginVerificationModal.tsx` - Alterar redirect_uri

## Resultado Esperado

- Após autenticar com Google, o usuário retorna para `/auth`
- A página `/auth` detecta a sessão ativa e redireciona automaticamente para `/selecionar-ambiente`
- Sem mais erro 404 após login com Google
