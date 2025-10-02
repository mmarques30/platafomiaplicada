-- Adicionar colunas para armazenar insight da IA no formulário diagnóstico
ALTER TABLE formulario_diagnostico 
ADD COLUMN IF NOT EXISTS insight_ia JSONB,
ADD COLUMN IF NOT EXISTS insight_gerado_em TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN formulario_diagnostico.insight_ia IS 'Análise personalizada gerada pela IA após conclusão do formulário - contém análise de perfil, oportunidades, primeiros passos, alertas e recomendações de foco';
COMMENT ON COLUMN formulario_diagnostico.insight_gerado_em IS 'Data e hora em que o insight foi gerado pela IA';