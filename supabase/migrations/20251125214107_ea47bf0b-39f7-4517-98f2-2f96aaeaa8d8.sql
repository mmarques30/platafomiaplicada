-- Atualizar função user_has_access_level para dar acesso a todos os planos válidos
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
  
  -- Todos os planos ativos têm acesso ao conteúdo base
  -- academy, lab, skills, club, boost, legacy = todos podem ver trilhas
  RETURN user_plan IN ('academy', 'lab', 'skills', 'club', 'boost', 'legacy');
END;
$$;

-- Tornar todas as trilhas ativas visíveis para mentorados/alunos
UPDATE trilhas 
SET visivel_mentorados = true 
WHERE ativo = true;