-- Adicionar coluna de visibilidade aos materiais da comunidade
ALTER TABLE materiais_comunidade 
ADD COLUMN visibilidade TEXT NOT NULL DEFAULT 'pago';

-- Comentário para documentação
COMMENT ON COLUMN materiais_comunidade.visibilidade IS 'Visibilidade do material: gratuito (todos) ou pago (apenas mentorados)';