-- Criar tabela ferramentas_compartilhadas
CREATE TABLE ferramentas_compartilhadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  link TEXT,
  categoria TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE ferramentas_compartilhadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view all active shared tools" ON ferramentas_compartilhadas
  FOR SELECT USING (ativo = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own shared tools" ON ferramentas_compartilhadas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared tools" ON ferramentas_compartilhadas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all shared tools" ON ferramentas_compartilhadas
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Criar função get_ranking_comunidade
CREATE OR REPLACE FUNCTION get_ranking_comunidade()
RETURNS TABLE (
  user_id UUID,
  nome_completo TEXT,
  avatar_url TEXT,
  total_pontos INTEGER,
  posicao INTEGER,
  total_videos_assistidos BIGINT,
  total_comentarios BIGINT,
  total_ferramentas_compartilhadas BIGINT,
  total_projetos_entregues BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id as uid,
      p.nome_completo,
      p.avatar_url,
      p.pontos_comunidade,
      -- Vídeos assistidos
      COALESCE((SELECT COUNT(*) FROM progresso_videos pv 
                WHERE pv.user_id = p.id AND pv.completado = true), 0) as videos,
      -- Comentários
      COALESCE((SELECT COUNT(*) FROM community_comments cc 
                WHERE cc.user_id = p.id), 0) as comentarios,
      -- Ferramentas compartilhadas
      COALESCE((SELECT COUNT(*) FROM ferramentas_compartilhadas fc 
                WHERE fc.user_id = p.id AND fc.ativo = true), 0) as ferramentas,
      -- Projetos entregues
      COALESCE((SELECT COUNT(*) FROM projetos_mentoria pm 
                WHERE pm.user_id = p.id AND pm.status = 'concluido'), 0) as projetos
    FROM profiles p
    WHERE p.conta_ativa = true 
      AND p.plano_mentoria IS NOT NULL
      AND p.is_visitante = false
  )
  SELECT 
    us.uid as user_id,
    us.nome_completo,
    us.avatar_url,
    (us.pontos_comunidade + (us.videos * 10) + (us.comentarios * 5) + (us.ferramentas * 15) + (us.projetos * 50))::INTEGER as total_pontos,
    ROW_NUMBER() OVER (ORDER BY 
      (us.pontos_comunidade + (us.videos * 10) + (us.comentarios * 5) + (us.ferramentas * 15) + (us.projetos * 50)) DESC
    )::INTEGER as posicao,
    us.videos as total_videos_assistidos,
    us.comentarios as total_comentarios,
    us.ferramentas as total_ferramentas_compartilhadas,
    us.projetos as total_projetos_entregues
  FROM user_stats us
  ORDER BY total_pontos DESC;
END;
$$;