-- Add etapa_id column to sessoes_mentoria to link sessions to stages
ALTER TABLE sessoes_mentoria 
ADD COLUMN etapa_id uuid REFERENCES etapas_business(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_sessoes_mentoria_etapa ON sessoes_mentoria(etapa_id);