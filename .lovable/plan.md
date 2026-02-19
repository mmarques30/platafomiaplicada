

# Auto-refresh do Ranking de Visitantes

## O que sera feito

Adicionar atualizacao automatica a cada 60 segundos no hook `useCommunityStatsGratuito`, que alimenta o ticker de metricas exibido apenas para visitantes no Dashboard e Trilhas.

## Alteracao

### `src/hooks/useCommunityStatsGratuito.tsx`

Adicionar `refetchInterval: 60000` nas opcoes do `useQuery`, fazendo com que os dados (total de visitantes, online, conteudos e materiais gratuitos) sejam recarregados automaticamente a cada 1 minuto sem necessidade de recarregar a pagina.

Nenhuma outra alteracao e necessaria -- o componente `RankingTickerGratuito` ja consome esse hook e reflete os dados atualizados automaticamente.

