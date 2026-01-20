-- Adicionar coluna etapa_id na tabela entregas_business
ALTER TABLE entregas_business 
ADD COLUMN etapa_id uuid REFERENCES etapas_business(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de consultas
CREATE INDEX idx_entregas_business_etapa ON entregas_business(etapa_id);