-- Adicionar foreign key entre video_feedbacks e profiles
ALTER TABLE video_feedbacks
ADD CONSTRAINT video_feedbacks_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_video_feedbacks_user_id 
ON video_feedbacks(user_id);

CREATE INDEX IF NOT EXISTS idx_video_feedbacks_video_id 
ON video_feedbacks(video_id);

-- Permitir que usuários autenticados vejam informações básicas de outros usuários (necessário para comentários)
DROP POLICY IF EXISTS "Users can view basic profile info" ON profiles;
CREATE POLICY "Users can view basic profile info"
ON profiles FOR SELECT
TO authenticated
USING (true);