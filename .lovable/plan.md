
# Plano: Login com Google com Restrições de Acesso

## Resumo das Regras de Negócio (Atualizado)

| Tipo de Usuário | Email Google (@gmail.com) | Email Não-Google | Novo Cadastro |
|-----------------|---------------------------|------------------|---------------|
| **Mentorado existente** | Pode usar Google | Precisa autorização do admin | N/A |
| **Visitante existente** | Pode usar Google | Não pode usar Google | N/A |
| **Novo usuário** | Não pode (precisa preencher dados primeiro) | Não pode | Só via formulário |

## Arquitetura da Solução

O fluxo de login com Google exige validação especial antes de permitir o acesso:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  FLUXO DE LOGIN COM GOOGLE                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Usuário clica em "Entrar com Google"                                │
│                     ↓                                                   │
│  2. Abre modal pedindo email para verificação prévia                    │
│                     ↓                                                   │
│  3. Edge function verifica se email existe na base                      │
│     - NÃO EXISTE → Bloquear (novos devem usar formulário)               │
│     - EXISTE:                                                           │
│         - Email @gmail.com → Permitir (mentorado OU visitante)          │
│         - Email não-Google + Visitante → Bloquear                       │
│         - Email não-Google + Mentorado → Verificar autorização          │
│                     ↓                                                   │
│  4. Se aprovado, redirecionar para OAuth do Google                      │
│                     ↓                                                   │
│  5. Callback processa login                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementação Detalhada

### Parte 1: Migração de Banco de Dados

Adicionar campo `google_login_autorizado` na tabela `profiles` para mentorados com email não-Google que receberam autorização do admin.

```sql
ALTER TABLE profiles 
ADD COLUMN google_login_autorizado boolean DEFAULT false;

COMMENT ON COLUMN profiles.google_login_autorizado IS 
  'Autorização do admin para login com Google quando o email não é @gmail.com';
```

### Parte 2: Configurar OAuth do Lovable Cloud

Usar a ferramenta `supabase--configure-social-auth` para gerar o módulo de integração com Google OAuth. Isso criará automaticamente os arquivos necessários em `src/integrations/lovable/`.

### Parte 3: Edge Function de Verificação

Criar `supabase/functions/verificar-google-login/index.ts` que valida se o usuário pode fazer login com Google ANTES de redirecionar para o OAuth.

**Lógica da função:**

```typescript
// Pseudocódigo da validação
function verificarPermissao(email: string) {
  const profile = await getProfileByEmail(email);
  
  // Novo usuário - deve usar formulário para preencher telefone
  if (!profile) {
    return { permitido: false, motivo: 'novo_usuario' };
  }
  
  // Email do Google (@gmail.com ou @googlemail.com) - pode sempre
  if (isGoogleEmail(email)) {
    return { permitido: true };
  }
  
  // Visitante com email não-Google - não pode
  if (profile.is_visitante) {
    return { permitido: false, motivo: 'visitante_email_nao_google' };
  }
  
  // Mentorado com email não-Google - precisa autorização
  if (profile.google_login_autorizado) {
    return { permitido: true };
  }
  
  return { permitido: false, motivo: 'nao_autorizado' };
}
```

### Parte 4: Componentes de Frontend

#### 4.1 Novo Componente: `GoogleLoginButton.tsx`

Botão estilizado para login com Google, seguindo o padrão visual da página de auth.

#### 4.2 Novo Componente: `GoogleLoginVerificationModal.tsx`

Modal que aparece ao clicar no botão Google:
- Input para o usuário digitar seu email
- Validação em tempo real
- Chamada à edge function de verificação
- Mensagens de erro contextuais
- Se aprovado, inicia o fluxo OAuth

#### 4.3 Atualizar: `LoginForm.tsx`

Adicionar o botão Google e integrar com o modal de verificação.

**Layout atualizado:**
```text
┌──────────────────────────────────────────┐
│  Email                                   │
│  [_______________________________]       │
│                                          │
│  Senha                                   │
│  [_______________________________]       │
│                                          │
│  [         Acessar         ]             │
│                                          │
│  ─────────── ou ───────────              │
│                                          │
│  [G] Entrar com Google                   │
│                                          │
│  Esqueceu a senha?                       │
└──────────────────────────────────────────┘
```

### Parte 5: Painel Admin - Autorização de Login Google

Adicionar toggle no modal de edição de mentorado (`EditMentoradoModal.tsx`) para autorizar login com Google quando o email não é @gmail.com.

O toggle só aparece quando o email do mentorado NÃO é @gmail.com (para emails Google, a autorização é automática).

## Mensagens de Feedback para o Usuário

| Situação | Mensagem |
|----------|----------|
| Email não encontrado | "Este email não está cadastrado. Use a aba 'Criar Conta' para se registrar com seus dados." |
| Visitante com email não-Google | "O login com Google está disponível apenas para emails @gmail.com. Entre com email e senha." |
| Mentorado sem autorização | "Seu email não é do Google. Solicite autorização ao administrador para usar este método de login." |
| Sucesso | Redireciona para OAuth do Google |

## Arquivos a Criar

1. `supabase/functions/verificar-google-login/index.ts` - Edge function de validação
2. `src/components/auth/GoogleLoginButton.tsx` - Botão de login com Google
3. `src/components/auth/GoogleLoginVerificationModal.tsx` - Modal de verificação de email

## Arquivos a Modificar

1. `src/components/auth/LoginForm.tsx` - Adicionar botão Google e integração
2. `src/components/admin/EditMentoradoModal.tsx` - Adicionar toggle de autorização Google
3. `supabase/config.toml` - Adicionar configuração da edge function
4. Migração SQL para adicionar coluna `google_login_autorizado`

## Segurança

- A verificação acontece ANTES do OAuth, evitando criação de contas não autorizadas
- O campo `google_login_autorizado` só pode ser alterado por admins (protegido por RLS)
- Novos cadastros via Google são impossíveis (validação requer email já existente)
- Edge function usa CORS adequado e não requer JWT (verificação é por email)

## Resultado Esperado

Após a implementação:
- Mentorados e visitantes com @gmail.com podem logar com Google imediatamente
- Mentorados com outros emails precisam de autorização prévia do admin
- Visitantes com emails não-Google são orientados a usar email/senha
- Novos usuários são orientados a criar conta pelo formulário (coletando telefone)
