-- Atualizar foreign keys para ON DELETE CASCADE

-- 1. modulos.trilha_id → trilhas.id
ALTER TABLE modulos
DROP CONSTRAINT IF EXISTS modulos_trilha_id_fkey,
ADD CONSTRAINT modulos_trilha_id_fkey 
  FOREIGN KEY (trilha_id) 
  REFERENCES trilhas(id) 
  ON DELETE CASCADE;

-- 2. videos.modulo_id → modulos.id
ALTER TABLE videos
DROP CONSTRAINT IF EXISTS videos_modulo_id_fkey,
ADD CONSTRAINT videos_modulo_id_fkey 
  FOREIGN KEY (modulo_id) 
  REFERENCES modulos(id) 
  ON DELETE CASCADE;

-- 3. videos.trilha_id → trilhas.id
ALTER TABLE videos
DROP CONSTRAINT IF EXISTS videos_trilha_id_fkey,
ADD CONSTRAINT videos_trilha_id_fkey 
  FOREIGN KEY (trilha_id) 
  REFERENCES trilhas(id) 
  ON DELETE CASCADE;

-- 4. cursos.trilha_id → trilhas.id
ALTER TABLE cursos
DROP CONSTRAINT IF EXISTS cursos_trilha_id_fkey,
ADD CONSTRAINT cursos_trilha_id_fkey 
  FOREIGN KEY (trilha_id) 
  REFERENCES trilhas(id) 
  ON DELETE CASCADE;

-- 5. exercicios_praticos.video_id → videos.id
ALTER TABLE exercicios_praticos
DROP CONSTRAINT IF EXISTS exercicios_praticos_video_id_fkey,
ADD CONSTRAINT exercicios_praticos_video_id_fkey 
  FOREIGN KEY (video_id) 
  REFERENCES videos(id) 
  ON DELETE CASCADE;

-- 6. progresso_videos.video_id → videos.id
ALTER TABLE progresso_videos
DROP CONSTRAINT IF EXISTS progresso_videos_video_id_fkey,
ADD CONSTRAINT progresso_videos_video_id_fkey 
  FOREIGN KEY (video_id) 
  REFERENCES videos(id) 
  ON DELETE CASCADE;

-- 7. respostas_exercicios.exercicio_id → exercicios_praticos.id
ALTER TABLE respostas_exercicios
DROP CONSTRAINT IF EXISTS respostas_exercicios_exercicio_id_fkey,
ADD CONSTRAINT respostas_exercicios_exercicio_id_fkey 
  FOREIGN KEY (exercicio_id) 
  REFERENCES exercicios_praticos(id) 
  ON DELETE CASCADE;

-- 8. video_ratings.video_id → videos.id
ALTER TABLE video_ratings
DROP CONSTRAINT IF EXISTS video_ratings_video_id_fkey,
ADD CONSTRAINT video_ratings_video_id_fkey 
  FOREIGN KEY (video_id) 
  REFERENCES videos(id) 
  ON DELETE CASCADE;

-- 9. video_feedbacks.video_id → videos.id
ALTER TABLE video_feedbacks
DROP CONSTRAINT IF EXISTS video_feedbacks_video_id_fkey,
ADD CONSTRAINT video_feedbacks_video_id_fkey 
  FOREIGN KEY (video_id) 
  REFERENCES videos(id) 
  ON DELETE CASCADE;

-- 10. certificados.trilha_id → trilhas.id
ALTER TABLE certificados
DROP CONSTRAINT IF EXISTS certificados_trilha_id_fkey,
ADD CONSTRAINT certificados_trilha_id_fkey 
  FOREIGN KEY (trilha_id) 
  REFERENCES trilhas(id) 
  ON DELETE CASCADE;