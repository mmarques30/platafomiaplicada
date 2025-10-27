-- Adicionar coluna duracao_estimada na tabela trilhas
ALTER TABLE trilhas 
ADD COLUMN duracao_estimada INTEGER;

-- Comentário explicativo
COMMENT ON COLUMN trilhas.duracao_estimada IS 'Duração total estimada da trilha em minutos';