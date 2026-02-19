
# Adicionar coluna "Reassistidos" no ranking de engajamento

## O que muda

Uma nova coluna na tabela do ranking mostrando quantos videos foram assistidos mais de uma vez. Isso incentiva o engajamento e mostra dedicacao dos visitantes.

## Como funciona o calculo

- **Videos assistidos** (atual): conta videos unicos (`COUNT(DISTINCT content_id)`)
- **Reassistidos** (novo): total de acessos a videos menos os unicos (`COUNT(*) - COUNT(DISTINCT content_id)`)

Exemplo: se um visitante assistiu o video A 3 vezes e o video B 1 vez, tera Videos = 2, Reassistidos = 2.

## Alteracoes

### 1. Funcao do banco de dados (`get_ranking_engajamento`)

- Adicionar um novo campo `total_videos_reassistidos` no retorno da funcao
- Calcular como `COUNT(*) - COUNT(DISTINCT content_id)` filtrando por `content_type = 'video'`

### 2. Hook `useRankingEngajamento.tsx`

- Adicionar `total_videos_reassistidos: number` na interface `RankingEngajamentoItem`

### 3. Componente `RankingEngajamento.tsx`

- Adicionar coluna "Reassistidos" no cabecalho da tabela (entre "Videos" e "Downloads")
- Adicionar a celula correspondente em cada linha da tabela (posicoes 4-10 e alem de 10)
- Adicionar o dado nos stats do Top 3, junto com videos e downloads

### 4. Dashboard `CommunityHeroDashboard.tsx`

- Nenhuma alteracao necessaria -- o dashboard nao exibe essa metrica

## Secao tecnica

SQL da funcao atualizada (trecho relevante):

```sql
RETURNS TABLE(
  ...campos existentes...,
  total_videos_reassistidos bigint  -- novo campo
)

-- Dentro do CTE user_stats:
COALESCE((SELECT COUNT(*) - COUNT(DISTINCT cal.content_id) 
          FROM content_access_logs cal 
          WHERE cal.user_email = p.email 
          AND cal.content_type = 'video'), 0) as reassistidos
```

No componente, a nova coluna ficara visivel apenas em telas `sm+` (igual as outras colunas de detalhe), mantendo o layout mobile limpo.
