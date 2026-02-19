
# Remover coluna "Progresso" da tabela Visao Geral de Projetos

## O que sera feito

Remover a coluna "Progresso" (ultima coluna, que exibe `progressoMedio%`) da tabela em `ProjetosResumoTable.tsx`, pois e redundante.

## Detalhes tecnicos

No arquivo `src/components/skills/kanban/ProjetosResumoTable.tsx`:

1. Remover o `<TableHead>` de "Progresso" (linha 77)
2. Remover o `<TableCell>` correspondente que exibe `p.progressoMedio%` (linhas 100-102)
3. Remover `progressoMedio` da interface `ProjetoAggregated` (linha 13) e do calculo no `useMemo` (linhas 42-45 e linha 53)
4. Corrigir o header duplicado "Entregas" (linhas 74-75) - um deveria ser "Entregas" e o outro provavelmente "Subtarefas"

A tabela ficara com 4 colunas: Projeto, Status, Entregas, Subtarefas.
