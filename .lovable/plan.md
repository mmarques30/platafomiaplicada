
# Ranking da Comunidade: Focar em Visitantes (usuarios gratuitos)

## Problema

A funcao `get_ranking_engajamento` atualmente consulta **todos os usuarios ativos** (`conta_ativa = true`), sem filtrar por tipo. Isso faz com que o ranking na aba "Ranking" de `/comunidade` mostre majoritariamente usuarios pagantes. O correto e mostrar apenas **visitantes** (usuarios gratuitos), ja que o ranking de pagantes fica em outra area da plataforma.

## Alteracao

### 1. Atualizar a funcao do banco `get_ranking_engajamento`

Adicionar o filtro `AND p.is_visitante = true` na clausula WHERE da CTE `user_stats`, garantindo que apenas visitantes aparecam no ranking.

A funcao ja retorna os campos corretos (`total_videos_assistidos`, `total_materiais_baixados`, `total_aulas_presentes`) e a formula de pontos ja esta certa (`videos * 10 + materiais * 5 + aulas * 25`). A unica mudanca e o filtro.

### 2. Adicionar coluna "Presencas" na UI

O componente `RankingEngajamento.tsx` ja mostra "Videos" e "Downloads" mas nao mostra "Presencas em aulas". Adicionar essa coluna na tabela e nos cards do top 3.

### Detalhes tecnicos

**Migracao SQL:**
```sql
CREATE OR REPLACE FUNCTION public.get_ranking_engajamento()
...
  FROM profiles p
  WHERE p.conta_ativa = true
    AND p.is_visitante = true   -- << unica mudanca
...
```

**Componente `RankingEngajamento.tsx`:**
- Top 3 cards: adicionar "X presencas" ao lado de videos e downloads
- Tabela: adicionar coluna "Presencas" com `item.total_aulas_presentes`

Nenhuma alteracao no hook -- a interface ja possui `total_aulas_presentes`.
