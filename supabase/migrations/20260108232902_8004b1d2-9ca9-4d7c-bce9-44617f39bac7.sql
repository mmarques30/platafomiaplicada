-- Adicionar controle de visibilidade para usuários gratuitos
ALTER TABLE conteudos_dashboard 
ADD COLUMN IF NOT EXISTS visivel_gratuitos BOOLEAN DEFAULT true;

ALTER TABLE materiais_gratuitos 
ADD COLUMN IF NOT EXISTS visivel_gratuitos BOOLEAN DEFAULT true;

-- Por padrão, marcar como visíveis para gratuitos
UPDATE conteudos_dashboard SET visivel_gratuitos = true WHERE visivel_gratuitos IS NULL;
UPDATE materiais_gratuitos SET visivel_gratuitos = true WHERE visivel_gratuitos IS NULL;