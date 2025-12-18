-- Adicionar política para admin poder ATUALIZAR diagnósticos de qualquer mentorado
CREATE POLICY "Admin pode atualizar diagnóstico de mentorados"
ON public.formulario_diagnostico
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));