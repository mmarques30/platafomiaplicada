-- Adicionar campos de avaliação separados
ALTER TABLE ferramentas_ia 
ADD COLUMN IF NOT EXISTS avaliacao_mari INTEGER CHECK (avaliacao_mari >= 1 AND avaliacao_mari <= 5),
ADD COLUMN IF NOT EXISTS avaliacao_comunidade NUMERIC(3,2) CHECK (avaliacao_comunidade >= 0 AND avaliacao_comunidade <= 5),
ADD COLUMN IF NOT EXISTS total_avaliacoes_comunidade INTEGER DEFAULT 0;

-- Migrar dados existentes: usar 'avaliacao' atual como 'avaliacao_mari'
UPDATE ferramentas_ia 
SET avaliacao_mari = avaliacao 
WHERE avaliacao IS NOT NULL AND avaliacao_mari IS NULL;

-- Comentário: Mantendo campo 'avaliacao' por compatibilidade