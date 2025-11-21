-- 1. Adicionar campo tipo em projetos_mentoria
ALTER TABLE projetos_mentoria 
ADD COLUMN tipo TEXT NOT NULL DEFAULT 'operacional' 
CHECK (tipo IN ('estrategico', 'operacional'));

-- 2. Migrar objetivos para projetos (como tipo estrategico)
INSERT INTO projetos_mentoria (
  user_id,
  titulo,
  descricao,
  objetivo_projeto,
  contribuicao_plano,
  status,
  data_entrega,
  progresso_preparacao,
  tipo,
  created_at,
  updated_at
)
SELECT 
  user_id,
  LEFT(objetivo, 100) as titulo,
  objetivo as descricao,
  objetivo as objetivo_projeto,
  COALESCE(observacoes, 'Objetivo estratégico') as contribuicao_plano,
  CASE 
    WHEN status = 'em_andamento' THEN 'em_andamento'::status_projeto
    WHEN status = 'concluido' THEN 'concluido'::status_projeto
    ELSE 'planejamento'::status_projeto
  END as status,
  prazo as data_entrega,
  COALESCE(progresso, 0) as progresso_preparacao,
  'estrategico' as tipo,
  created_at,
  updated_at
FROM objetivos_mentoria
WHERE NOT EXISTS (
  SELECT 1 FROM projetos_mentoria p 
  WHERE p.user_id = objetivos_mentoria.user_id 
  AND p.titulo = LEFT(objetivos_mentoria.objetivo, 100)
);

-- 3. Remover coluna objetivo_id (não precisamos mais)
ALTER TABLE projetos_mentoria DROP COLUMN IF EXISTS objetivo_id;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_projetos_tipo ON projetos_mentoria(tipo);
CREATE INDEX IF NOT EXISTS idx_projetos_user_tipo ON projetos_mentoria(user_id, tipo);