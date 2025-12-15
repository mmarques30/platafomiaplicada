
-- Criar tabela de usuários elegíveis para bônus
CREATE TABLE public.bonus_usuarios_elegiveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bonus_id UUID NOT NULL REFERENCES public.bonus_mentoria(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  liberado BOOLEAN DEFAULT false,
  data_liberacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(bonus_id, user_id)
);

-- Enable RLS
ALTER TABLE public.bonus_usuarios_elegiveis ENABLE ROW LEVEL SECURITY;

-- Admin pode gerenciar todos
CREATE POLICY "Admins can manage bonus_usuarios_elegiveis"
ON public.bonus_usuarios_elegiveis
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Usuários podem ver suas próprias elegibilidades
CREATE POLICY "Users can view their own eligibility"
ON public.bonus_usuarios_elegiveis
FOR SELECT
USING (auth.uid() = user_id);

-- Atualizar CHECK constraint de publico_alvo para incluir usuarios_especificos
ALTER TABLE public.bonus_mentoria DROP CONSTRAINT IF EXISTS bonus_mentoria_publico_alvo_check;
ALTER TABLE public.bonus_mentoria ADD CONSTRAINT bonus_mentoria_publico_alvo_check 
CHECK (publico_alvo IN ('todos', 'academy', 'lab', 'skills', 'club', 'usuario_especifico', 'usuarios_especificos'));

-- Migrar bônus existentes com usuario_especifico para a nova tabela
INSERT INTO public.bonus_usuarios_elegiveis (bonus_id, user_id, liberado, data_liberacao)
SELECT id, user_id, liberado, data_liberacao
FROM public.bonus_mentoria
WHERE publico_alvo = 'usuario_especifico' AND user_id IS NOT NULL;

-- Atualizar publico_alvo dos bônus migrados para usuarios_especificos
UPDATE public.bonus_mentoria
SET publico_alvo = 'usuarios_especificos'
WHERE publico_alvo = 'usuario_especifico' AND user_id IS NOT NULL;
