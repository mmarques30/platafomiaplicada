
-- Tabela de subtarefas das entregas de equipe
CREATE TABLE public.subtarefas_entregas_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_equipe_id UUID NOT NULL REFERENCES public.entregas_equipe_skills(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  responsavel_id UUID REFERENCES public.profiles(id),
  concluida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subtarefas_entregas_skills ENABLE ROW LEVEL SECURITY;

-- RLS: membros da equipe podem ver subtarefas (via entrega pai)
CREATE POLICY "Membros da equipe podem ver subtarefas"
ON public.subtarefas_entregas_skills
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.entregas_equipe_skills ee
    WHERE ee.id = entrega_equipe_id
    AND public.is_member_of_skills_team(ee.equipe_id)
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS: membros podem inserir
CREATE POLICY "Membros da equipe podem inserir subtarefas"
ON public.subtarefas_entregas_skills
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entregas_equipe_skills ee
    WHERE ee.id = entrega_equipe_id
    AND public.is_member_of_skills_team(ee.equipe_id)
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS: membros podem atualizar
CREATE POLICY "Membros da equipe podem atualizar subtarefas"
ON public.subtarefas_entregas_skills
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.entregas_equipe_skills ee
    WHERE ee.id = entrega_equipe_id
    AND public.is_member_of_skills_team(ee.equipe_id)
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS: membros podem deletar
CREATE POLICY "Membros da equipe podem deletar subtarefas"
ON public.subtarefas_entregas_skills
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.entregas_equipe_skills ee
    WHERE ee.id = entrega_equipe_id
    AND public.is_member_of_skills_team(ee.equipe_id)
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Trigger para updated_at
CREATE TRIGGER update_subtarefas_entregas_skills_updated_at
BEFORE UPDATE ON public.subtarefas_entregas_skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
