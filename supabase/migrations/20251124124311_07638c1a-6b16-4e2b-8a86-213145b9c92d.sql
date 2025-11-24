-- Criar função de validação de hierarquia
CREATE OR REPLACE FUNCTION user_has_access_level(required_level nivel_acesso_plano)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan
  FROM profiles
  WHERE id = auth.uid();
  
  IF user_plan IS NULL THEN RETURN false; END IF;
  
  -- Hierarquia: club < boost < legacy
  IF required_level = 'club' THEN
    RETURN user_plan IN ('club', 'boost', 'legacy');
  ELSIF required_level = 'boost' THEN
    RETURN user_plan IN ('boost', 'legacy');
  ELSIF required_level = 'legacy' THEN
    RETURN user_plan = 'legacy';
  END IF;
  
  RETURN false;
END;
$$;

-- Atualizar RLS Policies

-- Policy TRILHAS
DROP POLICY IF EXISTS "Users with roles can view active trilhas" ON trilhas;
CREATE POLICY "Users with roles can view active trilhas"
ON trilhas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (
    ativo = true 
    AND visivel_mentorados = true
    AND (
      has_role(auth.uid(), 'mentorado'::app_role) 
      OR has_role(auth.uid(), 'aluno_trilha'::app_role)
    )
    AND user_has_access_level(COALESCE(nivel_minimo_acesso, 'club'::nivel_acesso_plano))
  )
);

-- Policy MÓDULOS
DROP POLICY IF EXISTS "Users with roles can view active modulos" ON modulos;
CREATE POLICY "Users with roles can view active modulos"
ON modulos FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (
    ativo = true 
    AND visivel_mentorados = true
    AND (
      has_role(auth.uid(), 'mentorado'::app_role) 
      OR has_role(auth.uid(), 'aluno_trilha'::app_role)
    )
    AND user_has_access_level(COALESCE(nivel_minimo_acesso, 'club'::nivel_acesso_plano))
  )
);

-- Policy VÍDEOS
DROP POLICY IF EXISTS "Users with roles can view active videos" ON videos;
CREATE POLICY "Users with roles can view active videos"
ON videos FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (
    ativo = true 
    AND visivel_mentorados = true
    AND (
      has_role(auth.uid(), 'mentorado'::app_role) 
      OR has_role(auth.uid(), 'aluno_trilha'::app_role)
    )
    AND user_has_access_level(COALESCE(nivel_minimo_acesso, 'club'::nivel_acesso_plano))
  )
);