-- Ajustar RLS da tabela trilhas - remover condição de visitantes
-- Trilhas não devem ser visíveis para visitantes (apenas vídeos específicos)

DROP POLICY IF EXISTS "Trilhas visibility by user type and level" ON public.trilhas;

CREATE POLICY "Trilhas visibility by user type and level" ON public.trilhas
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (
    (ativo = true) AND 
    (visivel_mentorados = true OR bloqueada = true) AND 
    (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role)) AND
    user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano))
  )
);