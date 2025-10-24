-- Corrigir foreign key de vídeos para permitir exclusão controlada de módulos

-- Passo 1: Remover foreign key com CASCADE
ALTER TABLE videos 
DROP CONSTRAINT IF EXISTS videos_modulo_id_fkey;

-- Passo 2: Adicionar foreign key com RESTRICT
ALTER TABLE videos 
ADD CONSTRAINT videos_modulo_id_fkey 
FOREIGN KEY (modulo_id) 
REFERENCES modulos(id) 
ON DELETE RESTRICT;

-- Passo 3: Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_videos_modulo_id 
ON videos(modulo_id);