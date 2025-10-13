-- Adicionar coluna ferramentas_recomendadas nas tabelas das bibliotecas
ALTER TABLE biblioteca_prompts 
ADD COLUMN IF NOT EXISTS ferramentas_recomendadas JSONB DEFAULT '[]'::jsonb;

ALTER TABLE metodos_aplicar 
ADD COLUMN IF NOT EXISTS ferramentas_recomendadas JSONB DEFAULT '[]'::jsonb;

ALTER TABLE ia_copie_use 
ADD COLUMN IF NOT EXISTS ferramentas_recomendadas JSONB DEFAULT '[]'::jsonb;

-- Criar índices GIN para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_biblioteca_prompts_ferramentas 
ON biblioteca_prompts USING GIN (ferramentas_recomendadas);

CREATE INDEX IF NOT EXISTS idx_metodos_aplicar_ferramentas 
ON metodos_aplicar USING GIN (ferramentas_recomendadas);

CREATE INDEX IF NOT EXISTS idx_ia_copie_use_ferramentas 
ON ia_copie_use USING GIN (ferramentas_recomendadas);

-- Comentários para documentação
COMMENT ON COLUMN biblioteca_prompts.ferramentas_recomendadas IS 'Array de nomes de ferramentas onde o prompt pode ser aplicado (ex: ["ChatGPT", "Claude", "Gemini"])';
COMMENT ON COLUMN metodos_aplicar.ferramentas_recomendadas IS 'Array de nomes de ferramentas onde o método pode ser aplicado';
COMMENT ON COLUMN ia_copie_use.ferramentas_recomendadas IS 'Array de nomes de ferramentas onde o conteúdo pode ser aplicado';