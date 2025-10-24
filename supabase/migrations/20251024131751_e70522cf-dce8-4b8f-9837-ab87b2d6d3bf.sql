-- Corrigir foreign key de módulos para permitir gestão adequada de trilhas

-- Passo 1: Remover foreign key atual
ALTER TABLE modulos 
DROP CONSTRAINT IF EXISTS modulos_trilha_id_fkey;

-- Passo 2: Adicionar foreign key com RESTRICT e CASCADE
ALTER TABLE modulos 
ADD CONSTRAINT modulos_trilha_id_fkey 
FOREIGN KEY (trilha_id) 
REFERENCES trilhas(id) 
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Passo 3: Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_modulos_trilha_id 
ON modulos(trilha_id);