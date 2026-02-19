
# Refatorar Ranking da Comunidade: Metricas de Conteudo

## Contexto

Hoje o ranking na aba "Ranking" da pagina `/comunidade` usa a funcao `get_ranking_engajamento`, que pontua por **posts, comentarios, likes e dias ativos** -- metricas sociais. O pedido e mudar para metricas de **consumo de conteudo**: videos assistidos, materiais baixados e aulas presenciais (essa ultima sera integrada depois).

Atualmente ja existe uma funcao `get_ranking_comunidade` que faz exatamente isso (videos assistidos, ferramentas compartilhadas, projetos entregues), mas ela nao esta sendo usada na pagina de Comunidade.

## Alteracoes

### 1. Atualizar a funcao do banco `get_ranking_engajamento`

Substituir a logica de calculo para usar metricas de consumo em vez de metricas sociais:

- **Remover**: posts, comentarios, likes dados, likes recebidos, dias ativos
- **Adicionar**: `total_videos_assistidos` (de `progresso_videos`), `total_materiais_baixados` (de `content_access_logs`), `total_aulas_presentes` (placeholder com valor 0 por agora, sera conectado depois)
- **Nova formula de pontos**: `(videos * 10) + (materiais * 5) + (aulas * 25)`

### 2. Atualizar a interface no hook `useRankingEngajamento.tsx`

Trocar os campos da interface `RankingEngajamentoItem`:
- Remover: `total_posts`, `total_comentarios`, `total_likes_dados`, `total_likes_recebidos`, `dias_ativos_30d`
- Adicionar: `total_videos_assistidos`, `total_materiais_baixados`, `total_aulas_presentes`

### 3. Atualizar o componente `RankingEngajamento.tsx`

- Top 3 cards: trocar "X posts . Y com." por "X videos . Y downloads"
- Tabela de posicoes 4+: trocar colunas "Posts" e "Comentarios" por "Videos" e "Downloads"

### 4. Atualizar o componente `CommunityHeroDashboard.tsx`

- Trocar "Interacoes (posts/comments)" por "Videos assistidos"
- Trocar "Dias Ativos" por "Downloads"
- Ajustar icones correspondentes

### 5. Atualizar o `CommunitySidebar.tsx`

- Na secao "Como pontuar", trocar as regras:
  - "Assistir video" = 10pts
  - "Baixar material" = 5pts  
  - "Aula presencial" = 25pts
- Remover as regras de posts, likes e comentarios

### Detalhes tecnicos

**Migracao SQL** - nova versao de `get_ranking_engajamento`:

```sql
CREATE OR REPLACE FUNCTION public.get_ranking_engajamento()
RETURNS TABLE(
  user_id uuid, nome_completo text, avatar_url text,
  total_pontos integer, posicao integer,
  total_videos_assistidos bigint,
  total_materiais_baixados bigint,
  total_aulas_presentes bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id as uid, p.nome_completo, p.avatar_url,
      COALESCE((SELECT COUNT(*) FROM progresso_videos pv 
                WHERE pv.user_id = p.id AND pv.completado = true), 0) as videos,
      COALESCE((SELECT COUNT(*) FROM content_access_logs cal 
                WHERE cal.user_email = p.email 
                AND cal.content_type = 'material'), 0) as materiais,
      0::BIGINT as aulas  -- placeholder para integracao futura
    FROM profiles p
    WHERE p.conta_ativa = true
  )
  SELECT 
    us.uid, us.nome_completo, us.avatar_url,
    ((us.videos * 10) + (us.materiais * 5) + (us.aulas * 25))::INTEGER as total_pontos,
    ROW_NUMBER() OVER (ORDER BY 
      ((us.videos * 10) + (us.materiais * 5) + (us.aulas * 25)) DESC
    )::INTEGER as posicao,
    us.videos, us.materiais, us.aulas
  FROM user_stats us
  ORDER BY total_pontos DESC;
END;
$$;
```

**Interface TypeScript atualizada:**
```typescript
export interface RankingEngajamentoItem {
  user_id: string;
  nome_completo: string;
  avatar_url: string;
  total_pontos: number;
  posicao: number;
  total_videos_assistidos: number;
  total_materiais_baixados: number;
  total_aulas_presentes: number;
}
```

A coluna `total_aulas_presentes` ficara com valor 0 ate a integracao com o outro painel ser fornecida.
