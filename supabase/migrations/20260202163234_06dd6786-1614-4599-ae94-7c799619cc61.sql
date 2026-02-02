-- ============================================
-- MÓDULO SKILLS - TABELAS PARA EQUIPES B2B
-- ============================================

-- 1. EQUIPES SKILLS - Agrupa membros de uma empresa
CREATE TABLE public.equipes_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  lider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  empresa_nome TEXT,
  setor TEXT,
  status TEXT DEFAULT 'ativo',
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MEMBROS EQUIPE SKILLS - Vincula usuários a equipes
CREATE TABLE public.membros_equipe_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cargo TEXT,
  papel TEXT DEFAULT 'membro' CHECK (papel IN ('lider', 'membro')),
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(equipe_id, user_id)
);

-- 3. DIAGNOSTICOS SKILLS - Formulário individual do membro
CREATE TABLE public.diagnosticos_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  equipe_id UUID REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  
  cargo TEXT,
  area_atuacao TEXT,
  tempo_na_empresa TEXT,
  
  tarefas_manuais JSONB DEFAULT '[]'::jsonb,
  ferramentas_atuais JSONB DEFAULT '[]'::jsonb,
  
  processos_mais_demorados TEXT,
  gargalos_identificados JSONB DEFAULT '[]'::jsonb,
  onde_perde_mais_tempo TEXT,
  
  processos_repetitivos TEXT,
  onde_poderia_ser_mais_produtivo TEXT,
  interesse_em_ia TEXT,
  ja_usou_ia TEXT,
  
  completado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, equipe_id)
);

-- 4. DIAGNOSTICO CONSOLIDADO SKILLS - Visão IA compilada
CREATE TABLE public.diagnostico_consolidado_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID UNIQUE REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  
  dores_comuns JSONB DEFAULT '[]'::jsonb,
  sobreposicoes_esforco JSONB DEFAULT '[]'::jsonb,
  processos_maior_potencial JSONB DEFAULT '[]'::jsonb,
  insights_ia TEXT,
  recomendacoes JSONB DEFAULT '[]'::jsonb,
  
  total_horas_manuais_semana NUMERIC DEFAULT 0,
  potencial_economia_horas NUMERIC DEFAULT 0,
  
  gerado_em TIMESTAMPTZ,
  versao INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BACKLOG SKILLS - Soluções priorizadas
CREATE TABLE public.backlog_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  area_impactada TEXT,
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
  status TEXT DEFAULT 'levantado' CHECK (status IN ('levantado', 'priorizado', 'em_execucao', 'entregue')),
  horas_estimadas_economia NUMERIC DEFAULT 0,
  ordem INTEGER DEFAULT 0,
  origem TEXT DEFAULT 'diagnostico',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ROADMAP SKILLS - Fases do projeto 12 semanas
CREATE TABLE public.roadmap_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  numero_fase INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  semana_inicio INTEGER CHECK (semana_inicio >= 1 AND semana_inicio <= 12),
  semana_fim INTEGER CHECK (semana_fim >= 1 AND semana_fim <= 12),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  data_prevista DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ENTREGAS SKILLS - Tarefas individuais
CREATE TABLE public.entregas_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  backlog_item_id UUID REFERENCES public.backlog_skills(id) ON DELETE SET NULL,
  roadmap_fase_id UUID REFERENCES public.roadmap_skills(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  instrucoes TEXT,
  prompts_recomendados JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'aguardando_validacao', 'aprovada')),
  prazo DATE,
  aprovado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. METRICAS SKILLS - Acompanhamento semanal
CREATE TABLE public.metricas_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  semana INTEGER NOT NULL CHECK (semana >= 1 AND semana <= 12),
  horas_economizadas NUMERIC DEFAULT 0,
  processos_automatizados INTEGER DEFAULT 0,
  entregas_concluidas INTEGER DEFAULT 0,
  entregas_planejadas INTEGER DEFAULT 0,
  engajamento_trilhas NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(equipe_id, semana)
);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.equipes_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_equipe_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostico_consolidado_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlog_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_member_of_skills_team(team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.membros_equipe_skills
    WHERE equipe_id = team_id AND user_id = auth.uid() AND status = 'ativo'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_leader_of_skills_team(team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.membros_equipe_skills
    WHERE equipe_id = team_id AND user_id = auth.uid() AND papel = 'lider' AND status = 'ativo'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- RLS POLICIES
-- ============================================

-- EQUIPES SKILLS
CREATE POLICY "Membros podem ver sua equipe"
  ON public.equipes_skills FOR SELECT
  USING (public.is_member_of_skills_team(id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode gerenciar equipes"
  ON public.equipes_skills FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- MEMBROS EQUIPE SKILLS
CREATE POLICY "Membros podem ver colegas da equipe"
  ON public.membros_equipe_skills FOR SELECT
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode gerenciar membros"
  ON public.membros_equipe_skills FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- DIAGNOSTICOS SKILLS
CREATE POLICY "Usuario pode ver/editar proprio diagnostico"
  ON public.diagnosticos_skills FOR ALL
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lider pode ver diagnosticos da equipe"
  ON public.diagnosticos_skills FOR SELECT
  USING (public.is_leader_of_skills_team(equipe_id));

-- DIAGNOSTICO CONSOLIDADO SKILLS
CREATE POLICY "Membros podem ver consolidado da equipe"
  ON public.diagnostico_consolidado_skills FOR SELECT
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode gerenciar consolidado"
  ON public.diagnostico_consolidado_skills FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- BACKLOG SKILLS
CREATE POLICY "Membros podem ver backlog da equipe"
  ON public.backlog_skills FOR SELECT
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lider e admin podem gerenciar backlog"
  ON public.backlog_skills FOR ALL
  USING (public.is_leader_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

-- ROADMAP SKILLS
CREATE POLICY "Membros podem ver roadmap da equipe"
  ON public.roadmap_skills FOR SELECT
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode gerenciar roadmap"
  ON public.roadmap_skills FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ENTREGAS SKILLS
CREATE POLICY "Membros podem ver entregas da equipe"
  ON public.entregas_skills FOR SELECT
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Responsavel pode atualizar propria entrega"
  ON public.entregas_skills FOR UPDATE
  USING (responsavel_id = auth.uid() OR public.is_leader_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode gerenciar entregas"
  ON public.entregas_skills FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- METRICAS SKILLS
CREATE POLICY "Membros podem ver metricas da equipe"
  ON public.metricas_skills FOR SELECT
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode gerenciar metricas"
  ON public.metricas_skills FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_membros_equipe_user ON public.membros_equipe_skills(user_id);
CREATE INDEX idx_membros_equipe_equipe ON public.membros_equipe_skills(equipe_id);
CREATE INDEX idx_diagnosticos_skills_user ON public.diagnosticos_skills(user_id);
CREATE INDEX idx_diagnosticos_skills_equipe ON public.diagnosticos_skills(equipe_id);
CREATE INDEX idx_backlog_skills_equipe ON public.backlog_skills(equipe_id);
CREATE INDEX idx_roadmap_skills_equipe ON public.roadmap_skills(equipe_id);
CREATE INDEX idx_entregas_skills_responsavel ON public.entregas_skills(responsavel_id);
CREATE INDEX idx_entregas_skills_equipe ON public.entregas_skills(equipe_id);

-- ============================================
-- ADICIONAR MENUS SKILLS
-- ============================================

INSERT INTO public.menu_config (menu_key, label, url, icon, parent_key, planos_permitidos, ordem, tipo, visivel)
VALUES 
  ('skills_equipe', 'Minha Equipe', '/skills/equipe', 'Users', 'meu_progresso', ARRAY['skills'], 34, 'sidebar', true),
  ('skills_backlog', 'Backlog', '/skills/backlog', 'ListTodo', 'meu_progresso', ARRAY['skills'], 35, 'sidebar', true),
  ('skills_roadmap', 'Roadmap', '/skills/roadmap', 'Map', 'meu_progresso', ARRAY['skills'], 36, 'sidebar', true),
  ('skills_entregas', 'Minhas Entregas', '/skills/entregas', 'CheckSquare', 'meu_progresso', ARRAY['skills'], 37, 'sidebar', true)
ON CONFLICT DO NOTHING;