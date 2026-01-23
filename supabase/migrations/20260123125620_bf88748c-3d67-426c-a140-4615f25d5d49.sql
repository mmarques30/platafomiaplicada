-- Expandir constraint de ferramenta para aceitar mais valores
ALTER TABLE instrucoes_etapa DROP CONSTRAINT IF EXISTS instrucoes_etapa_ferramenta_check;

ALTER TABLE instrucoes_etapa ADD CONSTRAINT instrucoes_etapa_ferramenta_check 
  CHECK (ferramenta = ANY (ARRAY[
    'claude'::text, 'lovable'::text, 'reuniao'::text, 'outro'::text,
    'drive'::text, 'notion'::text, 'supabase'::text, 'make'::text, 
    'n8n'::text, 'zapier'::text, 'mapa'::text
  ]));