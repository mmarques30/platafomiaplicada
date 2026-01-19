-- 1. Atualizar função user_has_access_level com hierarquia paralela correta
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level nivel_acesso_plano)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan FROM profiles WHERE id = auth.uid();
  IF user_plan IS NULL THEN RETURN false; END IF;
  
  -- Hierarquia paralela:
  -- Academy = base para todos
  -- Skills = skills + academy
  -- Business = business + academy
  
  CASE required_level
    WHEN 'academy' THEN 
      -- Todos os planos ativos veem conteúdo academy
      RETURN user_plan IN ('academy', 'skills', 'business');
    WHEN 'skills' THEN 
      -- Apenas Skills vê conteúdo skills
      RETURN user_plan = 'skills';
    WHEN 'business' THEN 
      -- Apenas Business vê conteúdo business
      RETURN user_plan = 'business';
    ELSE 
      RETURN false;
  END CASE;
END;
$$;

-- 2. Garantir roles corretas para usuários Business
-- Adicionar role 'mentorado' para Business
INSERT INTO user_roles (user_id, role)
SELECT p.id, 'mentorado'::app_role
FROM profiles p
WHERE p.plano_mentoria = 'business'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'mentorado'
  );

-- Adicionar role 'aluno_trilha' para Business
INSERT INTO user_roles (user_id, role)
SELECT p.id, 'aluno_trilha'::app_role
FROM profiles p
WHERE p.plano_mentoria = 'business'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'aluno_trilha'
  );

-- 3. Garantir roles corretas para usuários Academy
INSERT INTO user_roles (user_id, role)
SELECT p.id, 'aluno_trilha'::app_role
FROM profiles p
WHERE p.plano_mentoria = 'academy'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'aluno_trilha'
  );

-- 4. Garantir roles corretas para usuários Skills (se existirem)
INSERT INTO user_roles (user_id, role)
SELECT p.id, 'aluno_trilha'::app_role
FROM profiles p
WHERE p.plano_mentoria = 'skills'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'aluno_trilha'
  );