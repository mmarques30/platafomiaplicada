-- Adicionar campos para conteúdo exclusivo PRO
ALTER TABLE trilhas 
ADD COLUMN IF NOT EXISTS visivel_apenas_pro boolean DEFAULT false;

ALTER TABLE modulos 
ADD COLUMN IF NOT EXISTS visivel_apenas_pro boolean DEFAULT false;

ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS visivel_apenas_pro boolean DEFAULT false;

COMMENT ON COLUMN trilhas.visivel_apenas_pro IS 'Conteúdo exclusivo para mentorados PRO';
COMMENT ON COLUMN modulos.visivel_apenas_pro IS 'Conteúdo exclusivo para mentorados PRO';
COMMENT ON COLUMN videos.visivel_apenas_pro IS 'Conteúdo exclusivo para mentorados PRO';

-- Atualizar política de trilhas para incluir verificação PRO
DROP POLICY IF EXISTS "Users with roles can view active trilhas" ON trilhas;

CREATE POLICY "Users with roles can view active trilhas" ON trilhas
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (
    ativo = true AND 
    visivel_mentorados = true AND
    (
      (NOT visivel_apenas_pro AND (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)))
      OR
      (visivel_apenas_pro AND has_role(auth.uid(), 'mentorado'::app_role) AND 
       EXISTS(
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() 
         AND plano_mentoria = 'pro'::plano_mentoria
       ))
    )
  )
);

-- Atualizar política de módulos para incluir verificação PRO
DROP POLICY IF EXISTS "Users with roles can view active modulos" ON modulos;

CREATE POLICY "Users with roles can view active modulos" ON modulos
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (
    ativo = true AND 
    visivel_mentorados = true AND
    (
      (NOT visivel_apenas_pro AND (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)))
      OR
      (visivel_apenas_pro AND has_role(auth.uid(), 'mentorado'::app_role) AND 
       EXISTS(
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() 
         AND plano_mentoria = 'pro'::plano_mentoria
       ))
    )
  )
);

-- Atualizar política de vídeos para incluir verificação PRO
DROP POLICY IF EXISTS "Users with roles can view active videos" ON videos;

CREATE POLICY "Users with roles can view active videos" ON videos
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (
    ativo = true AND 
    visivel_mentorados = true AND
    (
      (NOT visivel_apenas_pro AND (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)))
      OR
      (visivel_apenas_pro AND has_role(auth.uid(), 'mentorado'::app_role) AND 
       EXISTS(
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() 
         AND plano_mentoria = 'pro'::plano_mentoria
       ))
    )
  )
);