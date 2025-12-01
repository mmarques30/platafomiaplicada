-- Criar tabela de logs de acesso de conteúdo
CREATE TABLE public.content_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'material')),
  content_id UUID NOT NULL,
  content_title TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance em consultas
CREATE INDEX idx_content_access_logs_user_email ON public.content_access_logs(user_email);
CREATE INDEX idx_content_access_logs_content_id ON public.content_access_logs(content_id);
CREATE INDEX idx_content_access_logs_accessed_at ON public.content_access_logs(accessed_at);

-- Habilitar Row Level Security
ALTER TABLE public.content_access_logs ENABLE ROW LEVEL SECURITY;

-- Política: qualquer usuário autenticado pode inserir logs (visitantes também)
CREATE POLICY "Users can insert own logs"
ON public.content_access_logs FOR INSERT 
WITH CHECK (true);

-- Política: apenas admins podem visualizar todos os logs
CREATE POLICY "Admins can view all logs"
ON public.content_access_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));