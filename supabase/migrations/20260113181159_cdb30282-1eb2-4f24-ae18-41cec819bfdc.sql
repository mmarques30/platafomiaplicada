-- Tabela para histórico de solicitações de recuperação de senha
CREATE TABLE public.password_reset_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'solicitado',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  erro_mensagem TEXT
);

-- Índices para performance
CREATE INDEX idx_password_reset_email ON public.password_reset_requests(email);
CREATE INDEX idx_password_reset_created ON public.password_reset_requests(created_at DESC);
CREATE INDEX idx_password_reset_status ON public.password_reset_requests(status);

-- Habilitar RLS
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem visualizar
CREATE POLICY "Admins podem ver solicitações de reset"
  ON public.password_reset_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política: Inserção pública (para registro de solicitações)
CREATE POLICY "Qualquer um pode solicitar reset"
  ON public.password_reset_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Política: Atualização apenas pelo sistema (via service role) ou admin
CREATE POLICY "Sistema pode atualizar status"
  ON public.password_reset_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND role = 'admin'
    )
  );