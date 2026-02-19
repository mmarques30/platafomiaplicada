
# Filtrar entregas ativas no Acompanhamento de Projetos

## Problema

O KPI "Total de Entregas" no Acompanhamento mostra **todas** as 48 entregas cadastradas, incluindo entregas vinculadas a projetos reprovados (`nao_aprovado`) ou ainda em triagem (`levantado`, `backlog`). Apenas entregas de projetos ativos devem aparecer.

## Solucao

Adicionar um filtro no `filteredEntregas` (em `ProjetoSkillsProjetosPage.tsx`) que exclui entregas cujo projeto vinculado (`backlog_item.status`) esteja em status inativo.

### Status considerados ativos (fase de execucao)

Conforme o workflow documentado: `aprovado`, `priorizado`, `em_execucao`, `entregue`

### Status excluidos

`levantado`, `nao_aprovado`, `backlog` (triagem ou reprovados)

## Alteracao unica

### `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

No `useMemo` do `filteredEntregas` (linhas 56-75), adicionar uma verificacao antes dos filtros existentes:

```typescript
// Excluir entregas de projetos inativos
const statusInativos = ["nao_aprovado", "levantado", "backlog"];
if (e.backlog_item?.status && statusInativos.includes(e.backlog_item.status)) return false;
```

Entregas sem projeto vinculado (`backlog_item` nulo) continuam aparecendo normalmente.

| Arquivo | Alteracao |
|---|---|
| `src/pages/skills/ProjetoSkillsProjetosPage.tsx` | Filtrar entregas com projeto inativo no `filteredEntregas` |

Isso afeta automaticamente todos os componentes que recebem `filteredEntregas`: KPIs, grafico, sidebar e tabela de resumo.
