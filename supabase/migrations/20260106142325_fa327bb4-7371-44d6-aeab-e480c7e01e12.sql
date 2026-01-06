-- Adicionar novo role 'facilitador' ao enum app_role
ALTER TYPE app_role ADD VALUE 'facilitador';

-- Criar tabela players para dados específicos dos facilitadores
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  codigo_indicacao TEXT UNIQUE NOT NULL,
  total_indicacoes INTEGER DEFAULT 0,
  comissao_acumulada DECIMAL(10,2) DEFAULT 0,
  data_player TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  whatsapp TEXT,
  especialidade TEXT,
  apresentacao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Política: todos autenticados podem ver players ativos
CREATE POLICY "Players visíveis para autenticados"
  ON public.players FOR SELECT TO authenticated
  USING (ativo = true);

-- Política: admins podem gerenciar todos os players
CREATE POLICY "Admins gerenciam players"
  ON public.players FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Política: player pode ver e atualizar seus próprios dados
CREATE POLICY "Player pode ver próprios dados"
  ON public.players FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Player pode atualizar próprios dados"
  ON public.players FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();