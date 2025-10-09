-- Adicionar campos para rastrear geração do plano de mentoria
ALTER TABLE formulario_diagnostico
ADD COLUMN plano_gerado BOOLEAN DEFAULT FALSE,
ADD COLUMN plano_gerado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN plano_gerado_por UUID;