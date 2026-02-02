-- Criar tabela de conteúdos liberados por equipe Skills
CREATE TABLE public.conteudos_liberados_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  trilha_id uuid REFERENCES public.trilhas(id) ON DELETE CASCADE,
  modulo_id uuid REFERENCES public.modulos(id) ON DELETE CASCADE,
  liberado_por uuid,
  motivo text DEFAULT 'manual',
  fase_roadmap_id uuid REFERENCES public.roadmap_skills(id) ON DELETE SET NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT check_trilha_ou_modulo CHECK (
    (trilha_id IS NOT NULL AND modulo_id IS NULL) OR 
    (trilha_id IS NULL AND modulo_id IS NOT NULL)
  )
);

-- Índices
CREATE INDEX idx_conteudos_liberados_skills_equipe ON public.conteudos_liberados_skills(equipe_id);
CREATE INDEX idx_conteudos_liberados_skills_trilha ON public.conteudos_liberados_skills(trilha_id);
CREATE INDEX idx_conteudos_liberados_skills_modulo ON public.conteudos_liberados_skills(modulo_id);

-- RLS
ALTER TABLE public.conteudos_liberados_skills ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Membros podem ver conteúdos da sua equipe" ON public.conteudos_liberados_skills
  FOR SELECT USING (
    equipe_id IN (
      SELECT equipe_id FROM public.membros_equipe_skills 
      WHERE user_id = auth.uid() AND status = 'ativo'
    )
  );

CREATE POLICY "Admins podem gerenciar todos os conteúdos" ON public.conteudos_liberados_skills
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Equipe pode gerenciar conteúdos" ON public.conteudos_liberados_skills
  FOR ALL USING (
    public.has_role(auth.uid(), 'equipe')
  );

-- Trigger para updated_at
CREATE TRIGGER update_conteudos_liberados_skills_updated_at
  BEFORE UPDATE ON public.conteudos_liberados_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir menu trilhas_skills
INSERT INTO public.menu_config (menu_key, label, url, parent_key, planos_permitidos, icon, ordem, tipo, visivel, editavel)
VALUES ('trilhas_skills', 'Trilhas Skills', '/skills/trilhas', 'aprender', ARRAY['skills'], 'BookMarked', 20, 'sidebar', true, true)
ON CONFLICT (menu_key) DO NOTHING;