-- Atualizar durações calculando soma dos vídeos de cada trilha
UPDATE trilhas t
SET duracao_estimada = (
  SELECT COALESCE(SUM(v.duracao), 0)
  FROM modulos m
  JOIN videos v ON v.modulo_id = m.id
  WHERE m.trilha_id = t.id
  AND m.ativo = true
  AND v.ativo = true
);

-- Atualizar descrições para versões curtas e objetivas
UPDATE trilhas
SET descricao = CASE 
  WHEN titulo ILIKE '%FUNDAMENTOS%' THEN 'Aprenda os fundamentos de IA do zero'
  WHEN titulo ILIKE '%FERRAMENTAS%' THEN 'Domine as principais ferramentas de IA do mercado'
  WHEN titulo ILIKE '%GESTÃO%' OR titulo ILIKE '%NEGÓCIOS%' THEN 'Transforme sua gestão e negócios com IA'
  ELSE descricao
END
WHERE descricao IS NULL OR LENGTH(descricao) > 100;