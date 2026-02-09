
-- ============================================
-- 4 novas tabelas para Admin Skills
-- ============================================

-- 1. contratos_skills
CREATE TABLE public.contratos_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  empresa_nome text,
  cnpj text,
  representante_nome text,
  representante_email text,
  duracao_programa_semanas integer DEFAULT 12,
  frequencia_encontros text DEFAULT 'semanal',
  reports_frequencia text DEFAULT 'trimestral',
  data_inicio date,
  data_fim date,
  valor_contrato numeric,
  roi_projetado numeric,
  projetos_por_trilha jsonb DEFAULT '[]'::jsonb,
  entregas_esperadas jsonb DEFAULT '[]'::jsonb,
  observacoes text,
  status text DEFAULT 'ativo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. documentos_skills
CREATE TABLE public.documentos_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  contrato_id uuid REFERENCES public.contratos_skills(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  tipo text DEFAULT 'anexo',
  arquivo_url text,
  conteudo_texto text,
  para_processamento_ia boolean DEFAULT false,
  processado boolean DEFAULT false,
  resultado_ia jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. reports_skills
CREATE TABLE public.reports_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  contrato_id uuid REFERENCES public.contratos_skills(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  periodo_referencia text,
  trimestre integer,
  data_envio timestamptz DEFAULT now(),
  arquivo_url text,
  conteudo_html text,
  resumo_executivo text,
  metricas jsonb,
  gerado_por_ia boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. links_skills
CREATE TABLE public.links_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  url text NOT NULL,
  descricao text,
  icone text DEFAULT 'link',
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.contratos_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links_skills ENABLE ROW LEVEL SECURITY;

-- Policies: admins full access
CREATE POLICY "Admins full access contratos_skills" ON public.contratos_skills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins full access documentos_skills" ON public.documentos_skills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins full access reports_skills" ON public.reports_skills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins full access links_skills" ON public.links_skills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Leaders can read their team's data
CREATE POLICY "Leaders read contratos_skills" ON public.contratos_skills
  FOR SELECT TO authenticated
  USING (public.is_leader_of_skills_team(equipe_id));

CREATE POLICY "Leaders read documentos_skills" ON public.documentos_skills
  FOR SELECT TO authenticated
  USING (public.is_leader_of_skills_team(equipe_id));

CREATE POLICY "Leaders read reports_skills" ON public.reports_skills
  FOR SELECT TO authenticated
  USING (public.is_leader_of_skills_team(equipe_id));

CREATE POLICY "Leaders read links_skills" ON public.links_skills
  FOR SELECT TO authenticated
  USING (public.is_leader_of_skills_team(equipe_id));

-- Trigger updated_at for contratos_skills
CREATE TRIGGER update_contratos_skills_updated_at
  BEFORE UPDATE ON public.contratos_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for skills documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-skills', 'documentos-skills', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins upload documentos-skills" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos-skills' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read documentos-skills" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documentos-skills' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete documentos-skills" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documentos-skills' AND public.has_role(auth.uid(), 'admin'));
