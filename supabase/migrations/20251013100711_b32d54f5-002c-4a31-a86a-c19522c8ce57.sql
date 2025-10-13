-- Adicionar novos campos na tabela modulos
ALTER TABLE modulos 
ADD COLUMN IF NOT EXISTS data_inicio DATE;

ALTER TABLE modulos 
ADD COLUMN IF NOT EXISTS categoria TEXT 
CHECK (categoria IN ('aula_ao_vivo', 'gravacao_videos', 'conteudo_mentorados', 'outro'));

-- Criar índice para melhor performance em queries por categoria
CREATE INDEX IF NOT EXISTS idx_modulos_categoria ON modulos(categoria);

-- Adicionar campo de data da aula na tabela videos
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS data_aula DATE;

-- Criar índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_videos_data_aula ON videos(data_aula);

-- Comentários para documentação
COMMENT ON COLUMN modulos.data_inicio IS 'Data de início do módulo';
COMMENT ON COLUMN modulos.categoria IS 'Tipo do módulo: aula_ao_vivo, gravacao_videos, conteudo_mentorados, outro';
COMMENT ON COLUMN videos.data_aula IS 'Data em que a aula aconteceu (para revisões)';