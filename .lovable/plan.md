

# Correcao de status do Backlog Skills

## Problema
O Kanban do backlog define 3 colunas com os status:
- `levantado`
- `em_andamento`
- `concluido`

Porem o banco de dados tem um CHECK constraint que so aceita:
- `levantado`
- `priorizado`
- `em_execucao`
- `entregue`

Quando voce arrasta um projeto para "EM ANDAMENTO" ou "CONCLUIDO", o banco rejeita porque `em_andamento` e `concluido` nao existem no constraint.

O log do banco confirma: `new row for relation "backlog_skills" violates check constraint "backlog_skills_status_check"`

## Solucao

Alinhar o frontend com os valores do banco. Alterar o componente `BacklogKanban.tsx` para usar os status corretos:

| Coluna no Kanban | Status atual (errado) | Status correto (banco) |
|---|---|---|
| LEVANTADO | `levantado` | `levantado` (ok) |
| EM ANDAMENTO | `em_andamento` | `em_execucao` |
| CONCLUIDO | `concluido` | `entregue` |

## Alteracao

**Arquivo: `src/components/skills/backlog/BacklogKanban.tsx`**

Atualizar a definicao das colunas:

```typescript
const columns = [
  { id: "levantado", title: "LEVANTADO", headerBg: "hsl(var(--muted))" },
  { id: "em_execucao", title: "EM ANDAMENTO", headerBg: "rgba(158, 176, 56, 0.12)" },
  { id: "entregue", title: "CONCLUIDO", headerBg: "rgba(115, 137, 37, 0.15)" },
];
```

Isso e uma mudanca de 2 linhas, sem impacto em nenhum outro componente. O `BacklogView.tsx` ja passa `updateStatus.mutate({ id, status })` com o ID da coluna, entao ao corrigir os IDs das colunas tudo funciona automaticamente.

