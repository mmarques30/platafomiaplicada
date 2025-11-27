-- Migração: Atualizar sistema de níveis de acesso para Academy, Lab, Skills, Club

-- 1. Remover defaults
ALTER TABLE modulos ALTER COLUMN nivel_minimo_acesso DROP DEFAULT;
ALTER TABLE videos ALTER COLUMN nivel_minimo_acesso DROP DEFAULT;
ALTER TABLE trilhas ALTER COLUMN nivel_minimo_acesso DROP DEFAULT;

-- 2. Dropar políticas RLS que dependem de nivel_minimo_acesso
DROP POLICY IF EXISTS "Users with roles can view active modulos" ON modulos;
DROP POLICY IF EXISTS "Users with roles can view active videos" ON videos;
DROP POLICY IF EXISTS "Users with roles can view active trilhas" ON trilhas;

-- 3. Dropar função que depende do enum
DROP FUNCTION IF EXISTS public.user_has_access_level(nivel_acesso_plano);

-- 4. Migrar dados existentes
UPDATE modulos SET nivel_minimo_acesso = 'club'::nivel_acesso_plano WHERE nivel_minimo_acesso::text IN ('boost', 'legacy');
UPDATE videos SET nivel_minimo_acesso = 'club'::nivel_acesso_plano WHERE nivel_minimo_acesso::text IN ('boost', 'legacy');
UPDATE trilhas SET nivel_minimo_acesso = 'club'::nivel_acesso_plano WHERE nivel_minimo_acesso::text IN ('boost', 'legacy');

-- 5. Recriar o enum
ALTER TYPE nivel_acesso_plano RENAME TO nivel_acesso_plano_old;
CREATE TYPE nivel_acesso_plano AS ENUM ('academy', 'lab', 'skills', 'club');

-- 6. Atualizar colunas
ALTER TABLE modulos ALTER COLUMN nivel_minimo_acesso TYPE nivel_acesso_plano USING nivel_minimo_acesso::text::nivel_acesso_plano;
ALTER TABLE videos ALTER COLUMN nivel_minimo_acesso TYPE nivel_acesso_plano USING nivel_minimo_acesso::text::nivel_acesso_plano;
ALTER TABLE trilhas ALTER COLUMN nivel_minimo_acesso TYPE nivel_acesso_plano USING nivel_minimo_acesso::text::nivel_acesso_plano;

-- 7. Remover enum antigo
DROP TYPE nivel_acesso_plano_old;

-- 8. Recriar defaults
ALTER TABLE modulos ALTER COLUMN nivel_minimo_acesso SET DEFAULT 'academy'::nivel_acesso_plano;
ALTER TABLE videos ALTER COLUMN nivel_minimo_acesso SET DEFAULT 'academy'::nivel_acesso_plano;
ALTER TABLE trilhas ALTER COLUMN nivel_minimo_acesso SET DEFAULT 'academy'::nivel_acesso_plano;

-- 9. Recriar função user_has_access_level com nova lógica
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level nivel_acesso_plano)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_plan plano_mentoria;
BEGIN
  SELECT plano_mentoria INTO user_plan FROM profiles WHERE id = auth.uid();
  IF user_plan IS NULL THEN RETURN false; END IF;
  
  -- Lógica de hierarquia:
  -- Club vê tudo (academy, lab, skills, club)
  -- Lab vê academy + lab
  -- Skills vê academy + skills
  -- Academy vê apenas academy
  
  CASE required_level
    WHEN 'academy' THEN RETURN user_plan IN ('academy', 'lab', 'skills', 'club', 'boost', 'legacy');
    WHEN 'lab' THEN RETURN user_plan IN ('lab', 'club', 'boost', 'legacy');
    WHEN 'skills' THEN RETURN user_plan IN ('skills', 'club');
    WHEN 'club' THEN RETURN user_plan IN ('club', 'boost', 'legacy');
    ELSE RETURN false;
  END CASE;
END;
$function$;

-- 10. Recriar políticas RLS
CREATE POLICY "Users with roles can view active modulos" ON modulos
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  ((ativo = true) AND (visivel_mentorados = true) AND 
   (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)) AND
   user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
);

CREATE POLICY "Users with roles can view active videos" ON videos
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  ((ativo = true) AND (visivel_mentorados = true) AND 
   (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)) AND
   user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
);

CREATE POLICY "Users with roles can view active trilhas" ON trilhas
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  ((ativo = true) AND (visivel_mentorados = true) AND 
   (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)) AND
   user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
);