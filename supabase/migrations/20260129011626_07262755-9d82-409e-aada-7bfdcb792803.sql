-- Atualizar políticas RLS para materiais_comunidade
-- Permitir que mentorados insiram materiais onde são o criador

-- Remover políticas antigas de INSERT e UPDATE se existirem
DROP POLICY IF EXISTS "materiais_comunidade_insert_policy" ON materiais_comunidade;
DROP POLICY IF EXISTS "materiais_comunidade_update_policy" ON materiais_comunidade;
DROP POLICY IF EXISTS "Admins can insert materiais_comunidade" ON materiais_comunidade;
DROP POLICY IF EXISTS "Admins can update materiais_comunidade" ON materiais_comunidade;

-- Nova política de INSERT: Admin pode inserir qualquer coisa, mentorados podem inserir como criador
CREATE POLICY "materiais_comunidade_insert_policy"
ON materiais_comunidade FOR INSERT TO authenticated
WITH CHECK (
  -- Admin pode inserir qualquer registro
  (public.has_role(auth.uid(), 'admin'::app_role)) 
  OR 
  -- Mentorados podem inserir apenas onde são o criador
  (criador_id = auth.uid())
);

-- Nova política de UPDATE: Admin pode atualizar qualquer coisa, mentorados podem atualizar seus próprios
CREATE POLICY "materiais_comunidade_update_policy"
ON materiais_comunidade FOR UPDATE TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin'::app_role))
  OR
  (criador_id = auth.uid())
)
WITH CHECK (
  (public.has_role(auth.uid(), 'admin'::app_role))
  OR
  (criador_id = auth.uid())
);