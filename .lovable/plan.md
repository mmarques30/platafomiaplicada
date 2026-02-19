

# Mover Observacoes para depois das Trilhas

## Alteracao

No arquivo `ProjetoDetailModal.tsx`, mover a secao "Observacoes" (linhas 285-305) para logo apos a secao "Trilhas Recomendadas" (linha 488), adicionando um componente `Separator` entre elas.

## Ordem atual das secoes no modal

1. Status + Prioridade
2. Acoes de status
3. Descricao
4. **Observacoes** (posicao atual)
5. Info grid (Area, Economia)
6. Responsavel
7. Colaborador
8. Tags
9. Trilhas Recomendadas
10. Entregas do Projeto

## Nova ordem

1. Status + Prioridade
2. Acoes de status
3. Descricao
4. Info grid (Area, Economia)
5. Responsavel
6. Colaborador
7. Tags
8. Trilhas Recomendadas
9. **Separator (divisor horizontal)**
10. **Observacoes** (nova posicao)
11. Entregas do Projeto

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Remover bloco de Observacoes da linha 285-305, reinserir apos as Trilhas (linha 488) precedido por um `<Separator />`. Adicionar import do componente `Separator`. |

