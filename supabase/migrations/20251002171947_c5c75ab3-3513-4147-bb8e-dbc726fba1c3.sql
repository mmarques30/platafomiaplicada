-- Criar tabela de favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('trilha', 'curso', 'modulo', 'video')),
  item_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tipo, item_id)
);

ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para favoritos
CREATE POLICY "Users can view their own favoritos"
ON public.favoritos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favoritos"
ON public.favoritos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favoritos"
ON public.favoritos
FOR DELETE
USING (auth.uid() = user_id);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  mensagem text,
  tipo text NOT NULL CHECK (tipo IN ('info', 'alerta', 'novo_conteudo', 'urgente')),
  link text,
  lida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY "Users can view their own notificacoes"
ON public.notificacoes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notificacoes"
ON public.notificacoes
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins podem criar notificações
CREATE POLICY "Admins can create notificacoes"
ON public.notificacoes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_favoritos_user_id ON public.favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_item_id ON public.favoritos(item_id, tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(user_id, lida);