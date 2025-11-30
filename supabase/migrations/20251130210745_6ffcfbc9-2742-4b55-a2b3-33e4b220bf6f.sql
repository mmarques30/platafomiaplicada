-- Drop existing policy for viewing trilhas
DROP POLICY IF EXISTS "Users and visitors can view active trilhas" ON public.trilhas;

-- Create new comprehensive RLS policy for trilhas
CREATE POLICY "Trilhas visibility by user type and level"
ON public.trilhas
FOR SELECT
USING (
  -- Admins see everything
  has_role(auth.uid(), 'admin'::app_role) OR
  
  -- Visitors see only visivel_visitantes = true
  ((visivel_visitantes = true) AND has_role(auth.uid(), 'visitante'::app_role)) OR
  
  -- Mentorados/Alunos see:
  -- - ativo = true (must be active)
  -- - AND (visivel_mentorados = true OR bloqueada = true) to show published OR locked trails
  -- - AND user has appropriate access level
  ((ativo = true) AND 
   (visivel_mentorados = true OR bloqueada = true) AND 
   (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)) AND
   user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano)))
);