

# Etapas clicaveis no RoadMap

## Alteracao

### `src/components/meu-sistema/TimelineEtapas.tsx`
- Importar `useNavigate` do react-router-dom
- Adicionar `cursor-pointer` e `hover:shadow-md` no Card de cada etapa
- Ao clicar no card, navegar para `/mentoria/etapa/{etapaId}` que ja existe e mostra o detalhamento completo (objetivo, entregas com status, marcos, progresso)

A pagina de detalhe (`MentoriaEtapa.tsx`) ja exibe: descricao/objetivo, entregas com status e prioridade, progresso, marcos da proxima etapa. Nenhuma alteracao necessaria nessa pagina.

Apenas 1 arquivo editado: `TimelineEtapas.tsx` (3 linhas adicionadas/modificadas).

