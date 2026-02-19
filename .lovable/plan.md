

# Corrigir contagem de videos assistidos no ranking de engajamento

## Problema

A funcao `get_ranking_engajamento()` conta videos assistidos pela tabela `progresso_videos` (onde `completado = true`), mas visitantes quase nao registram dados nessa tabela. Os visitantes assistem videos gratuitos e o acesso e registrado na tabela `content_access_logs` com `content_type = 'video'`.

Dados atuais no banco:
- `content_access_logs` (visitantes, tipo video): **136 registros**
- `progresso_videos` (visitantes, completado): **apenas 2 registros**

Ou seja, o ranking mostra quase zero videos para todos os visitantes.

## Solucao

Atualizar a funcao `get_ranking_engajamento()` no banco de dados para contar videos assistidos a partir de `content_access_logs` (com `content_type = 'video'`) em vez de `progresso_videos`.

### Secao tecnica

Substituir a funcao SQL por:

```sql
CREATE OR REPLACE FUNCTION public.get_ranking_engajamento()
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id as uid, p.nome_completo, p.avatar_url,
      -- Videos: contar acessos distintos em content_access_logs
      COALESCE((SELECT COUNT(DISTINCT cal.content_id) 
                FROM content_access_logs cal 
                WHERE cal.user_email = p.email 
                AND cal.content_type = 'video'), 0) as videos,
      -- Materiais: manter igual (ja usa content_access_logs)
      COALESCE((SELECT COUNT(DISTINCT cal.content_id) 
                FROM content_access_logs cal 
                WHERE cal.user_email = p.email 
                AND cal.content_type = 'material'), 0) as materiais,
      0::BIGINT as aulas
    FROM profiles p
    WHERE p.conta_ativa = true
      AND p.is_visitante = true
  )
  SELECT ...
  ORDER BY total_pontos DESC;
END;
$$
```

Mudancas principais:
- Videos: troca `progresso_videos` por `content_access_logs` com `COUNT(DISTINCT content_id)` para evitar contar acessos duplicados ao mesmo video
- Materiais: adiciona `DISTINCT content_id` para evitar duplicatas tambem
- Nenhuma alteracao no frontend -- o componente `RankingEngajamento.tsx` ja exibe os dados corretamente

