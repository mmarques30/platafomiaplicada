-- Adicionar coluna imagem_url na tabela produtos
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;