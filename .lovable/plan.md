
# Corrigir Ranking de Visitantes para mostrar engajamento real

## Problema atual

O `RankingTickerGratuito` exibe apenas contagens estaticas de conteudos disponiveis (quantos conteudos gratuitos existem no sistema), mas nao mostra metricas reais de engajamento dos visitantes como videos assistidos e materiais baixados.

As metricas atuais vem da funcao `get_gratuito_stats` que consulta `conteudos_dashboard` (catalogo). O correto e tambem incluir dados da tabela `content_access_logs` que registra cada acesso real.

## Alteracoes

### 1. Atualizar a funcao do banco `get_gratuito_stats`

Adicionar duas novas colunas ao retorno:
- `total_videos_assistidos`: COUNT de logs com `content_type = 'video'` feitos por visitantes
- `total_materiais_baixados`: COUNT de logs com `content_type = 'material'` feitos por visitantes

A filtragem por visitantes sera feita cruzando `content_access_logs.user_email` com `profiles.email WHERE is_visitante = true`.

### 2. Atualizar o hook `useCommunityStatsGratuito.tsx`

Adicionar os dois novos campos na interface `GratuitoStats` e no mapeamento de retorno.

### 3. Atualizar o componente `RankingTickerGratuito.tsx`

Substituir as metricas estaticas ("Conteudos gratis" e "Materiais") pelas metricas reais:
- "Videos assistidos" (com icone Video) mostrando `total_videos_assistidos`
- "Materiais baixados" (com icone FileText) mostrando `total_materiais_baixados`

Manter "Visitantes" e "Online agora" como estao.

### Detalhes tecnicos

**Migracao SQL** - nova versao de `get_gratuito_stats`:

```sql
CREATE OR REPLACE FUNCTION public.get_gratuito_stats()
RETURNS TABLE(
  total_visitantes bigint,
  online_visitantes bigint,
  total_conteudos_gratuitos bigint,
  total_materiais_gratuitos bigint,
  total_videos_assistidos bigint,
  total_materiais_baixados bigint
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT COUNT(*) FROM profiles
     WHERE is_visitante = true AND conta_ativa = true),
    (SELECT COUNT(*) FROM profiles
     WHERE is_visitante = true AND conta_ativa = true
     AND ultimo_acesso > NOW() - INTERVAL '5 minutes'),
    (SELECT COUNT(*) FROM conteudos_dashboard
     WHERE ativo = true AND visivel_gratuitos = true),
    (SELECT COUNT(*) FROM conteudos_dashboard
     WHERE ativo = true AND visivel_gratuitos = true
     AND tipo = 'material'),
    (SELECT COUNT(*) FROM content_access_logs cal
     JOIN profiles p ON cal.user_email = p.email
     WHERE p.is_visitante = true AND cal.content_type = 'video'),
    (SELECT COUNT(*) FROM content_access_logs cal
     JOIN profiles p ON cal.user_email = p.email
     WHERE p.is_visitante = true AND cal.content_type = 'material');
$$;
```

**Hook** - adicionar campos:
```typescript
interface GratuitoStats {
  // campos existentes...
  total_videos_assistidos: number;
  total_materiais_baixados: number;
}
```

**Componente** - trocar os StatItems:
- "Conteudos gratis" -> "Videos assistidos" (total_videos_assistidos)
- "Materiais" -> "Downloads" (total_materiais_baixados)
