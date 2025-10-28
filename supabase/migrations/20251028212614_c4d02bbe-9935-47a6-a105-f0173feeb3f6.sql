-- Adicionar coluna visivel_mentorados nas 3 tabelas
ALTER TABLE trilhas 
ADD COLUMN IF NOT EXISTS visivel_mentorados boolean DEFAULT false;

ALTER TABLE modulos 
ADD COLUMN IF NOT EXISTS visivel_mentorados boolean DEFAULT false;

ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS visivel_mentorados boolean DEFAULT false;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_trilhas_visivel ON trilhas(visivel_mentorados) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_modulos_visivel ON modulos(visivel_mentorados) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_videos_visivel ON videos(visivel_mentorados) WHERE ativo = true;

-- Atualizar política RLS para Trilhas
DROP POLICY IF EXISTS "Users with roles can view active trilhas" ON trilhas;

CREATE POLICY "Users with roles can view active trilhas" ON trilhas
  FOR SELECT
  USING (
    (ativo = true AND visivel_mentorados = true AND (
      has_role(auth.uid(), 'mentorado'::app_role) OR 
      has_role(auth.uid(), 'aluno_trilha'::app_role)
    )) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Atualizar política RLS para Módulos
DROP POLICY IF EXISTS "Users with roles can view active modulos" ON modulos;

CREATE POLICY "Users with roles can view active modulos" ON modulos
  FOR SELECT
  USING (
    (ativo = true AND visivel_mentorados = true AND (
      has_role(auth.uid(), 'mentorado'::app_role) OR 
      has_role(auth.uid(), 'aluno_trilha'::app_role)
    )) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Atualizar política RLS para Vídeos
DROP POLICY IF EXISTS "Users with roles can view active videos" ON videos;

CREATE POLICY "Users with roles can view active videos" ON videos
  FOR SELECT
  USING (
    (ativo = true AND visivel_mentorados = true AND (
      has_role(auth.uid(), 'mentorado'::app_role) OR 
      has_role(auth.uid(), 'aluno_trilha'::app_role)
    )) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );