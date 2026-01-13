-- Criar tabela de tokens temporários para recuperação de senha
CREATE TABLE public.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX idx_password_reset_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_token_email ON public.password_reset_tokens(email);
CREATE INDEX idx_password_reset_token_expires ON public.password_reset_tokens(expires_at);

-- RLS: apenas service role pode manipular (edge functions)
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy para usuários normais - apenas service role tem acesso