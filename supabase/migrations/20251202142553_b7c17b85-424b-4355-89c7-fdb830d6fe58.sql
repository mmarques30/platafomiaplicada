-- Criar tabela para rastrear avisos lidos por usuário
CREATE TABLE public.avisos_lidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  aviso_id UUID NOT NULL REFERENCES public.avisos(id) ON DELETE CASCADE,
  lido_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, aviso_id)
);

-- Habilitar RLS
ALTER TABLE public.avisos_lidos ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios registros
CREATE POLICY "Users can view their own read notices"
  ON public.avisos_lidos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem marcar avisos como lidos
CREATE POLICY "Users can mark notices as read"
  ON public.avisos_lidos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index para performance
CREATE INDEX idx_avisos_lidos_user_id ON public.avisos_lidos(user_id);
CREATE INDEX idx_avisos_lidos_aviso_id ON public.avisos_lidos(aviso_id);