-- Adicionar colunas para preparação de projetos
ALTER TABLE projetos_mentoria
ADD COLUMN IF NOT EXISTS trilhas_recomendadas jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS modulos_obrigatorios jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progresso_preparacao integer DEFAULT 0;

COMMENT ON COLUMN projetos_mentoria.trilhas_recomendadas IS 
'Array de {trilha_id, titulo, prioridade: essencial|recomendado|opcional}';

COMMENT ON COLUMN projetos_mentoria.modulos_obrigatorios IS 
'Array de {modulo_id, titulo, trilha_titulo, video_ids: [], concluido: boolean}';

COMMENT ON COLUMN projetos_mentoria.progresso_preparacao IS 
'Percentual de conclusão dos módulos obrigatórios (0-100)';

-- Função para calcular progresso de preparação
CREATE OR REPLACE FUNCTION calcular_progresso_preparacao(p_projeto_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_videos integer := 0;
  videos_concluidos integer := 0;
  video_id uuid;
  modulos jsonb;
  modulo jsonb;
  vid text;
BEGIN
  -- Buscar módulos obrigatórios do projeto
  SELECT modulos_obrigatorios INTO modulos
  FROM projetos_mentoria
  WHERE id = p_projeto_id;
  
  -- Se não tiver módulos, retorna 0
  IF modulos IS NULL OR jsonb_array_length(modulos) = 0 THEN
    RETURN 0;
  END IF;
  
  -- Contar total de vídeos e vídeos concluídos
  FOR modulo IN SELECT * FROM jsonb_array_elements(modulos)
  LOOP
    FOR vid IN SELECT * FROM jsonb_array_elements_text(modulo->'video_ids')
    LOOP
      total_videos := total_videos + 1;
      video_id := vid::uuid;
      
      -- Verificar se o vídeo foi concluído
      IF EXISTS (
        SELECT 1 FROM progresso_videos 
        WHERE user_id = p_user_id 
        AND video_id = video_id 
        AND completado = true
      ) THEN
        videos_concluidos := videos_concluidos + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Calcular percentual
  IF total_videos = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((videos_concluidos::numeric / total_videos::numeric) * 100);
  END IF;
END;
$$;

-- Trigger para atualizar progresso automaticamente
CREATE OR REPLACE FUNCTION atualizar_progresso_projeto()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  projeto_record RECORD;
BEGIN
  -- Buscar projetos do usuário que têm módulos obrigatórios
  FOR projeto_record IN 
    SELECT id FROM projetos_mentoria 
    WHERE user_id = NEW.user_id 
    AND jsonb_array_length(COALESCE(modulos_obrigatorios, '[]'::jsonb)) > 0
  LOOP
    UPDATE projetos_mentoria
    SET progresso_preparacao = calcular_progresso_preparacao(projeto_record.id, NEW.user_id),
        updated_at = NOW()
    WHERE id = projeto_record.id;
  END LOOP;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_atualizar_progresso_projeto ON progresso_videos;

CREATE TRIGGER trigger_atualizar_progresso_projeto
AFTER INSERT OR UPDATE ON progresso_videos
FOR EACH ROW
WHEN (NEW.completado = true)
EXECUTE FUNCTION atualizar_progresso_projeto();