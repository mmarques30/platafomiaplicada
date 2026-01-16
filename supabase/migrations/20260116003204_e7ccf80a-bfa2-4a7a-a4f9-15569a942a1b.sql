-- 1. Criar tabela de formulários do sistema
CREATE TABLE public.formularios_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL,
  etapas INTEGER DEFAULT 1,
  icon TEXT,
  rota_form TEXT,
  rota_admin TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS policy
ALTER TABLE public.formularios_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar formularios do sistema"
  ON public.formularios_sistema FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem modificar formularios do sistema"
  ON public.formularios_sistema FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 3. Inserir formulários existentes
INSERT INTO public.formularios_sistema (slug, titulo, descricao, categoria, tipo, etapas, icon, rota_form, rota_admin) VALUES
('diagnostico-academy', 'Diagnóstico Academy', 'Formulário focado em aprendizado pessoal e desenvolvimento de habilidades em IA', 'diagnostico', 'academy', 5, 'GraduationCap', '/diagnostico/formulario', '/admin/bibliotecas?tab=formularios'),
('diagnostico-business', 'Diagnóstico Business', 'Formulário focado em projetos, entregas e ROI de implementações de IA', 'diagnostico', 'business', 6, 'Briefcase', '/mentoria/diagnostico', '/admin/bibliotecas?tab=formularios'),
('diagnostico-legacy', 'Diagnóstico Mentoria', 'Formulário completo original com 7 etapas (versão anterior)', 'diagnostico', 'legacy', 7, 'Users', '/mentoria/diagnostico', '/admin/bibliotecas?tab=formularios'),
('formulario-aplica', 'Pesquisa de Perfil IAplicada', 'Pesquisa para conhecer candidatos interessados na mentoria', 'pesquisa', 'aplicacao', 5, 'FileText', '/formulario-aplica', '/admin/pesquisas'),
('candidatura-mentoria', 'Candidatura Mentoria Club', 'Formulário de candidatura para o programa de mentoria premium', 'candidatura', 'candidatura', 7, 'Crown', '/candidatar-mentoria', '/admin/candidaturas');

-- 4. Trigger para updated_at
CREATE TRIGGER update_formularios_sistema_updated_at
  BEFORE UPDATE ON public.formularios_sistema
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();