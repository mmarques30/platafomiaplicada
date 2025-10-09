-- ============================================
-- FASE 1: SEGURANÇA - SENHA TEMPORÁRIA
-- ============================================

-- Adicionar colunas de controle de senha à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS senha_temporaria BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS senha_alterada_em TIMESTAMP WITH TIME ZONE;

-- ============================================
-- FASE 2: AUDITORIA - HISTÓRICO COMPLETO
-- ============================================

-- Criar view para facilitar consulta de auditoria
CREATE OR REPLACE VIEW historico_completo AS
SELECT 
  a.created_at,
  a.tabela,
  a.operacao,
  a.registro_id,
  p.nome_completo as usuario,
  a.campos_alterados,
  a.dados_anteriores,
  a.dados_novos
FROM auditoria_conteudo a
LEFT JOIN profiles p ON p.id = a.user_id
ORDER BY a.created_at DESC;

-- ============================================
-- FASE 3: FUNÇÃO DE VERIFICAÇÃO DE INTEGRIDADE
-- ============================================

CREATE OR REPLACE FUNCTION verificar_integridade_sistema()
RETURNS TABLE (
  categoria TEXT,
  item TEXT,
  status TEXT,
  detalhes TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar RLS habilitado em tabelas públicas
  RETURN QUERY
  SELECT 
    'RLS'::TEXT as categoria,
    tablename::TEXT as item,
    CASE WHEN rowsecurity THEN 'OK' ELSE 'ATENÇÃO' END as status,
    'Row Level Security'::TEXT as detalhes
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%';
  
  -- Verificar triggers ativos
  RETURN QUERY
  SELECT
    'TRIGGERS'::TEXT as categoria,
    event_object_table::TEXT as item,
    'OK'::TEXT as status,
    trigger_name::TEXT as detalhes
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';
  
  -- Verificar buckets de storage
  RETURN QUERY
  SELECT
    'STORAGE'::TEXT as categoria,
    name::TEXT as item,
    'OK'::TEXT as status,
    CASE WHEN public THEN 'Público' ELSE 'Privado' END as detalhes
  FROM storage.buckets;
END;
$$;