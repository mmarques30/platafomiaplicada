-- Criar tabela de categorias de módulos
CREATE TABLE categorias_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#6366f1',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at_categorias_modulos
  BEFORE UPDATE ON categorias_modulos
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Inserir categorias padrão (migração dos valores atuais)
INSERT INTO categorias_modulos (nome, slug, descricao, ordem) VALUES
  ('Aula ao Vivo', 'aula_ao_vivo', 'Módulos de aulas síncronas ao vivo', 1),
  ('Gravação de Vídeos', 'gravacao_videos', 'Módulos com conteúdo gravado', 2),
  ('Conteúdo Específico para Mentorados', 'conteudo_mentorados', 'Materiais exclusivos para mentorados', 3),
  ('Outro', 'outro', 'Outros tipos de módulos', 4);

-- RLS Policies
ALTER TABLE categorias_modulos ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar categorias
CREATE POLICY "Admins can manage categorias_modulos"
  ON categorias_modulos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Usuários autenticados podem visualizar categorias ativas
CREATE POLICY "Authenticated users can view active categorias"
  ON categorias_modulos
  FOR SELECT
  USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));