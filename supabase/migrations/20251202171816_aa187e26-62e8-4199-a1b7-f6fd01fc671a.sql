-- Drop e recria a view com SECURITY INVOKER
DROP VIEW IF EXISTS public.historico_completo;

CREATE VIEW public.historico_completo
WITH (security_invoker = true)
AS
SELECT 
  a.created_at,
  a.tabela,
  a.operacao,
  a.registro_id,
  p.nome_completo AS usuario,
  a.campos_alterados,
  a.dados_anteriores,
  a.dados_novos
FROM auditoria_conteudo a
LEFT JOIN profiles p ON p.id = a.user_id
ORDER BY a.created_at DESC;