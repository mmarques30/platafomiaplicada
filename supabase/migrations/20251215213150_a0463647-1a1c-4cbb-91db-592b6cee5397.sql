-- Add publico_alvo field to bonus_mentoria to support global bonuses
ALTER TABLE public.bonus_mentoria 
ADD COLUMN publico_alvo text NOT NULL DEFAULT 'usuario_especifico';

-- Make user_id nullable for global bonuses (when publico_alvo != 'usuario_especifico')
ALTER TABLE public.bonus_mentoria 
ALTER COLUMN user_id DROP NOT NULL;

-- Add check constraint for valid publico_alvo values
ALTER TABLE public.bonus_mentoria
ADD CONSTRAINT bonus_mentoria_publico_alvo_check 
CHECK (publico_alvo IN ('todos', 'academy', 'lab', 'club', 'skills', 'usuario_especifico'));

-- Add constraint: user_id required when publico_alvo is 'usuario_especifico'
ALTER TABLE public.bonus_mentoria
ADD CONSTRAINT bonus_mentoria_user_id_required 
CHECK (
  (publico_alvo = 'usuario_especifico' AND user_id IS NOT NULL) OR
  (publico_alvo != 'usuario_especifico')
);

-- Update RLS policy to allow viewing global bonuses
DROP POLICY IF EXISTS "Users can view their own bonus" ON public.bonus_mentoria;

CREATE POLICY "Users can view their bonuses or global bonuses"
ON public.bonus_mentoria
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  auth.uid() = user_id OR
  (
    publico_alvo = 'todos' OR
    (publico_alvo = 'academy' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plano_mentoria = 'academy')) OR
    (publico_alvo = 'lab' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plano_mentoria = 'lab')) OR
    (publico_alvo = 'club' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plano_mentoria = 'club')) OR
    (publico_alvo = 'skills' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plano_mentoria = 'skills'))
  )
);