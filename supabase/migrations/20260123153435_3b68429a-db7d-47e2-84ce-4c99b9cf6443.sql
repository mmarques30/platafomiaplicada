-- Adicionar coluna para diferenciar documentos para processamento IA
ALTER TABLE documentos_business 
ADD COLUMN IF NOT EXISTS para_processamento_ia BOOLEAN DEFAULT false;

-- Marcar documentos existentes do tipo 'solucao' e 'transcricao' como para processamento IA
UPDATE documentos_business 
SET para_processamento_ia = true 
WHERE tipo IN ('solucao', 'transcricao');

COMMENT ON COLUMN documentos_business.para_processamento_ia IS 
'Se true, documento é usado para processamento IA na geração de entregas. Se false, é documento para download do mentorado.';