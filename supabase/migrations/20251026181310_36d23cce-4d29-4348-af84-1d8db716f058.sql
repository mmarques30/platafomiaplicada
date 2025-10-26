-- Adicionar coluna para armazenar URL da imagem de cada módulo
ALTER TABLE modulos 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

COMMENT ON COLUMN modulos.imagem_url IS 'URL da imagem específica do módulo';