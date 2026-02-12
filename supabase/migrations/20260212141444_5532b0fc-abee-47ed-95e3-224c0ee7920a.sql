
-- Tabela entregas_equipe_skills
CREATE TABLE public.entregas_equipe_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entrega_id UUID REFERENCES public.entregas_skills(id) ON DELETE CASCADE,
  equipe_id UUID NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  editado_por UUID,
  titulo_equipe TEXT NOT NULL,
  descricao_equipe TEXT,
  status_equipe TEXT NOT NULL DEFAULT 'pendente',
  prazo_equipe DATE,
  responsavel_id UUID,
  prioridade_equipe TEXT DEFAULT 'P2',
  notas TEXT,
  arquivos JSONB DEFAULT '[]'::jsonb,
  progresso INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_entregas_equipe_skills_updated_at
  BEFORE UPDATE ON public.entregas_equipe_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.entregas_equipe_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read team entregas"
  ON public.entregas_equipe_skills FOR SELECT
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can insert team entregas"
  ON public.entregas_equipe_skills FOR INSERT
  WITH CHECK (public.is_member_of_skills_team(equipe_id));

CREATE POLICY "Members can update team entregas"
  ON public.entregas_equipe_skills FOR UPDATE
  USING (public.is_member_of_skills_team(equipe_id));

CREATE POLICY "Members can delete team entregas"
  ON public.entregas_equipe_skills FOR DELETE
  USING (public.is_member_of_skills_team(equipe_id) OR public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public) VALUES ('entregas-equipe-skills', 'entregas-equipe-skills', false);

CREATE POLICY "Members can upload entregas equipe files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'entregas-equipe-skills' AND auth.role() = 'authenticated');

CREATE POLICY "Members can read entregas equipe files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'entregas-equipe-skills' AND auth.role() = 'authenticated');

CREATE POLICY "Members can delete entregas equipe files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'entregas-equipe-skills' AND auth.role() = 'authenticated');

INSERT INTO public.menu_config (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key, planos_permitidos)
VALUES ('projeto_skills_entregas', 'Entregas', 'sidebar', '/skills/projeto/entregas', 'Package', true, true, 5, 'projeto_skills', ARRAY['skills']);
