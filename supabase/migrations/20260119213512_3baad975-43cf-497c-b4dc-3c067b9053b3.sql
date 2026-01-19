-- Criar tabela de permissões admin
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  admin_path TEXT NOT NULL,
  admin_label TEXT NOT NULL,
  can_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, admin_path)
);

-- Habilitar RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Política: admins podem gerenciar permissões
CREATE POLICY "Admins can manage permissions"
  ON public.admin_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Política: usuários podem ler suas próprias permissões
CREATE POLICY "Users can read their role permissions"
  ON public.admin_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND user_roles.role = admin_permissions.role
    )
  );

-- Inserir permissões iniciais para equipe (todas bloqueadas por padrão)
INSERT INTO public.admin_permissions (role, admin_path, admin_label, can_access) VALUES
  ('equipe', '/admin', 'Dashboard', false),
  ('equipe', '/admin/usuarios', 'Gerenciar Usuários', false),
  ('equipe', '/admin/visitantes', 'Visitantes', false),
  ('equipe', '/admin/candidaturas', 'Candidaturas', false),
  ('equipe', '/admin/conteudo', 'Gerenciar Conteúdo', false),
  ('equipe', '/admin/bibliotecas', 'Gerenciar Bibliotecas', false),
  ('equipe', '/admin/materiais', 'Materiais Gratuitos', false),
  ('equipe', '/admin/mentoria/bonus', 'Bônus Globais', false),
  ('equipe', '/admin/mentoria/academy', 'Academy', false),
  ('equipe', '/admin/mentoria/business', 'Business', false),
  ('equipe', '/admin/mentoria/preview-paineis', 'Preview Painéis', false),
  ('equipe', '/admin/formularios', 'Diagnósticos', false),
  ('equipe', '/admin/duvidas', 'Central de Dúvidas', false),
  ('equipe', '/admin/avisos', 'Gerenciar Avisos', false),
  ('equipe', '/admin/comunidade', 'Comunidade', false),
  ('equipe', '/admin/pesquisas', 'Pesquisas', false),
  ('equipe', '/admin/produtos', 'Produtos', false),
  ('equipe', '/admin/minhas-tarefas', 'Minhas Tarefas', false),
  ('equipe', '/admin/menus', 'Menus', false),
  ('equipe', '/admin/auditoria', 'Auditoria do Sistema', false),
  ('equipe', '/admin/conhecimento', 'Base de Conhecimento', false);

-- Trigger para updated_at
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();