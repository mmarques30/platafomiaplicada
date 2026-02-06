-- =====================================================
-- TABELAS DO SQUAD ACADEMY
-- =====================================================

-- 1. Squads (equipes do programa)
CREATE TABLE public.squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  lider_id UUID REFERENCES public.profiles(id),
  empresa_nome TEXT,
  setor TEXT,
  data_inicio DATE,
  data_fim DATE,
  investimento NUMERIC DEFAULT 0,
  custo_hora_padrao NUMERIC DEFAULT 60,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Membros do Squad
CREATE TABLE public.membros_squad (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  cargo TEXT,
  papel TEXT NOT NULL DEFAULT 'membro',
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(squad_id, user_id)
);

-- 3. Entregas do Squad
CREATE TABLE public.entregas_squad (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES public.profiles(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  prazo DATE,
  economia_horas_semana NUMERIC DEFAULT 0,
  avaliacao_nota NUMERIC CHECK (avaliacao_nota >= 0 AND avaliacao_nota <= 5),
  avaliacao_comentario TEXT,
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Métricas do Squad (evolução de maturidade)
CREATE TABLE public.metricas_squad (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  semana INTEGER NOT NULL CHECK (semana >= 1 AND semana <= 12),
  horas_economizadas NUMERIC DEFAULT 0,
  processos_automatizados INTEGER DEFAULT 0,
  entregas_concluidas INTEGER DEFAULT 0,
  engajamento_trilhas NUMERIC DEFAULT 0,
  indice_maturidade NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(squad_id, semana)
);

-- 5. Roadmap do Squad
CREATE TABLE public.roadmap_squad (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  numero_fase INTEGER NOT NULL CHECK (numero_fase >= 1 AND numero_fase <= 3),
  nome_fase TEXT NOT NULL,
  semana_inicio INTEGER NOT NULL,
  semana_fim INTEGER NOT NULL,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(squad_id, numero_fase)
);

-- =====================================================
-- HABILITAR RLS
-- =====================================================

ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_squad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_squad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_squad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_squad ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- Squads: líder vê seu squad, admin vê todos
CREATE POLICY "Lider ve seu squad" ON public.squads
  FOR SELECT USING (
    lider_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin gerencia squads" ON public.squads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Membros: líder vê todos do squad, membro vê a si
CREATE POLICY "Membros do squad select" ON public.membros_squad
  FOR SELECT USING (
    user_id = auth.uid() OR
    squad_id IN (SELECT id FROM public.squads WHERE lider_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin gerencia membros" ON public.membros_squad
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Entregas: líder e responsável veem
CREATE POLICY "Entregas do squad select" ON public.entregas_squad
  FOR SELECT USING (
    responsavel_id = auth.uid() OR
    squad_id IN (SELECT id FROM public.squads WHERE lider_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin gerencia entregas" ON public.entregas_squad
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Métricas: líder vê seu squad
CREATE POLICY "Metricas do squad select" ON public.metricas_squad
  FOR SELECT USING (
    squad_id IN (SELECT id FROM public.squads WHERE lider_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin gerencia metricas" ON public.metricas_squad
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Roadmap: líder vê seu squad
CREATE POLICY "Roadmap do squad select" ON public.roadmap_squad
  FOR SELECT USING (
    squad_id IN (SELECT id FROM public.squads WHERE lider_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin gerencia roadmap" ON public.roadmap_squad
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- TRIGGERS DE UPDATED_AT
-- =====================================================

CREATE TRIGGER update_squads_updated_at
  BEFORE UPDATE ON public.squads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_membros_squad_updated_at
  BEFORE UPDATE ON public.membros_squad
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entregas_squad_updated_at
  BEFORE UPDATE ON public.entregas_squad
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmap_squad_updated_at
  BEFORE UPDATE ON public.roadmap_squad
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FUNÇÃO HELPER PARA VERIFICAR LÍDER DO SQUAD
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_leader_of_squad(team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.squads
    WHERE id = team_id AND lider_id = auth.uid()
  );
END;
$$;