

# Expandir formulário de cadastro com campos de perfil

## Resumo
Adicionar campos de onboarding ao signup (objetivo, área, desafio) e salvar numa nova tabela `user_onboarding_responses`.

## Alterações

### 1. Criar tabela `user_onboarding_responses`
Migração SQL:
```sql
CREATE TABLE public.user_onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  objetivo text NOT NULL,
  area_atuacao text NOT NULL,
  desafio_principal text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding" ON public.user_onboarding_responses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own onboarding" ON public.user_onboarding_responses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding" ON public.user_onboarding_responses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
```

### 2. Atualizar `src/components/auth/SignupForm.tsx`
Após os campos de email/senha, adicionar:
- **Select "Qual seu objetivo principal?"** (obrigatório) com 4 opções
- **Select "Área de atuação"** (obrigatório) com 6 opções
- **Textarea "Qual seu maior desafio hoje?"** (opcional, maxLength 200, contador de caracteres)

Todos com estilo consistente (`bg-zinc-800/80 border-white/10 text-white`).

No `handleVisitorSignup`, após signup bem-sucedido:
- Aguardar sessão do usuário
- Inserir na `user_onboarding_responses` com `user_id`, `nome`, `objetivo`, `area_atuacao`, `desafio_principal`

O campo `nome` já é salvo no profile via `handle_new_user` trigger (campo `nome_completo`), então não precisa de alteração adicional.

## Arquivos alterados
- Migração SQL (nova tabela)
- `src/components/auth/SignupForm.tsx`

