-- Criar tabela de configuração de menus
CREATE TABLE public.menu_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'sidebar',
  url TEXT,
  icon TEXT,
  visivel BOOLEAN DEFAULT true,
  editavel BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  parent_key TEXT,
  planos_permitidos TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.menu_config ENABLE ROW LEVEL SECURITY;

-- Política de leitura para todos autenticados
CREATE POLICY "Usuários podem ler menu_config"
ON public.menu_config FOR SELECT TO authenticated
USING (true);

-- Política de escrita apenas para admins
CREATE POLICY "Admins podem editar menu_config"
ON public.menu_config FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.menu_config
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Inserir dados iniciais
INSERT INTO public.menu_config (menu_key, label, tipo, url, icon, visivel, ordem) VALUES
  ('inicio', 'Início', 'sidebar', '/', 'Home', true, 1),
  ('trilhas', 'Trilhas', 'sidebar', '/trilhas', 'GraduationCap', true, 2),
  ('evolucao', 'Minha Evolução', 'sidebar', '/evolucao', 'TrendingUp', true, 3),
  ('ecossistema', 'Ecossistema', 'sidebar', '/ecossistema', 'Layers', false, 4),
  ('favoritos', 'Favoritos', 'sidebar', '/favoritos', 'Star', true, 5),
  ('chat', 'Chat IA', 'sidebar', '/chat', 'MessageSquare', true, 6),
  ('notificacoes', 'Notificações', 'sidebar', '/notificacoes', 'Bell', true, 7),
  ('meus_cursos', 'Meus Cursos', 'header', null, null, true, 1),
  ('ferramentas', 'Ferramentas', 'header', null, null, true, 2);