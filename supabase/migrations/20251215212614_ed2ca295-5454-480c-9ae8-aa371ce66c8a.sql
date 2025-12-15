-- Converter arquivo_url de TEXT para JSONB com array
ALTER TABLE bonus_mentoria 
  ALTER COLUMN arquivo_url TYPE JSONB 
  USING CASE 
    WHEN arquivo_url IS NOT NULL AND arquivo_url != '' THEN jsonb_build_array(arquivo_url)
    ELSE '[]'::jsonb 
  END;

-- Definir valor padrão como array vazio
ALTER TABLE bonus_mentoria 
  ALTER COLUMN arquivo_url SET DEFAULT '[]'::jsonb;