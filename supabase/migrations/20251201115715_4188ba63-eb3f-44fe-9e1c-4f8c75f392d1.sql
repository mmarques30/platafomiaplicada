-- Corrigir RLS de trilhas para incluir visitantes
DROP POLICY IF EXISTS "Trilhas visibility by user type and level" ON public.trilhas;

CREATE POLICY "Trilhas visibility by user type and level" ON public.trilhas
FOR SELECT USING (
  -- Admin tem acesso total
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Visitantes podem ver TODAS as trilhas (frontend mostra cadeado e bloqueia acesso ao conteúdo)
  has_role(auth.uid(), 'visitante'::app_role)
  OR
  -- Mentorados e alunos de trilha seguem a lógica atual de visibilidade e nível de acesso
  (
    (ativo = true)
    AND ((visivel_mentorados = true) OR (bloqueada = true))
    AND (has_role(auth.uid(), 'mentorado'::app_role) OR has_role(auth.uid(), 'aluno_trilha'::app_role))
    AND user_has_access_level(COALESCE(nivel_minimo_acesso, 'academy'::nivel_acesso_plano))
  )
);