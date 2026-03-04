

# Ajustar cards de Cronograma e Progresso Geral

## Alteracoes

### `src/components/meu-sistema/ProjetoOverviewCards.tsx`

1. **Cronograma**: Mostrar apenas o percentual, ex: `28%` em vez de `50/181 dias (28%)`

2. **Progresso Geral → Saude do Projeto**: Renomear para "Saude do Projeto" e calcular com base na comparacao entre progresso de entregas vs progresso do cronograma:
   - **Saudavel**: progresso de entregas >= progresso do cronograma (entregas estao no ritmo ou adiantadas)
   - **Avancado**: progresso de entregas > cronograma + 10% (significativamente adiantado)
   - **Em Risco**: progresso de entregas < progresso do cronograma (entregas atrasadas em relacao ao tempo)
   - Exibir com cor contextual (verde, azul, amarelo/vermelho)

### Props
- Remover `progressoGeral` dos props (sera calculado internamente)
- Manter `dataInicio`, `dataFim`, `entregasConcluidas`, `totalEntregas` para o calculo

### `src/pages/MeuSistema.tsx`
- Remover calculo e prop `progressoGeral`

2 arquivos editados.

