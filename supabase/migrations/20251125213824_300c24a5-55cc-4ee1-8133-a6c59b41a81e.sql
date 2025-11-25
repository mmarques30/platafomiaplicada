-- Atualizar função user_has_access_level para nova hierarquia de planos
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level nivel_acesso_plano)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan
  FROM profiles
  WHERE id = auth.uid();
  
  IF user_plan IS NULL THEN RETURN false; END IF;
  
  -- Nova hierarquia de acesso:
  -- club = acesso total (nível mais alto)
  -- boost = acesso intermediário (mantido para compatibilidade)
  -- legacy = acesso padrão (mantido para compatibilidade)
  -- academy = acesso básico às trilhas
  -- lab = acesso às trilhas + lab
  -- skills = acesso B2B às trilhas
  
  IF required_level = 'club' THEN
    -- Club requer plano club, boost, ou legacy (compatibilidade)
    RETURN user_plan IN ('club', 'boost', 'legacy');
  ELSIF required_level = 'boost' THEN
    -- Boost requer plano boost, legacy, ou club
    RETURN user_plan IN ('boost', 'legacy', 'club');
  ELSIF required_level = 'legacy' THEN
    -- Legacy é o nível base para conteúdo legado - todos os planos têm acesso
    RETURN user_plan IN ('legacy', 'club', 'boost', 'academy', 'lab', 'skills');
  END IF;
  
  RETURN false;
END;
$$;