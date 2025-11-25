-- Adicionar coluna tipo na tabela regras_upsell
ALTER TABLE regras_upsell 
ADD COLUMN tipo text NOT NULL DEFAULT 'upsell'
CHECK (tipo IN ('upsell', 'renovacao'));

-- Atualizar registros existentes onde origem = destino como renovação
UPDATE regras_upsell 
SET tipo = 'renovacao' 
WHERE produto_origem_id = produto_destino_id;

-- Comentário para documentação
COMMENT ON COLUMN regras_upsell.tipo IS 'Tipo da regra: upsell (produto diferente) ou renovacao (mesmo produto)';