

# Separar "Aprovado" e "Priorizado" no Kanban

## Problema
Hoje os status `aprovado` e `priorizado` caem na mesma coluna "PRIORIZADO", sem distinção visual. O usuário precisa saber quais projetos foram apenas aprovados e quais já foram priorizados para execução.

## Solução
Separar em 5 colunas no Kanban, adicionando a coluna "APROVADO" entre "LEVANTADO" e "PRIORIZADO".

```text
|--- TRIAGEM ---------|-------------- EXECUÇÃO ------------------|
| LEVANTADO | APROVADO | PRIORIZADO | EM EXECUÇÃO |   ENTREGUE   |
```

## Alterações

### `BacklogKanban.tsx`

1. **Adicionar coluna "APROVADO"** no array `columns`:
   - `{ id: "aprovado", title: "APROVADO", headerBg: "rgba(59, 130, 246, 0.10)", statuses: ["aprovado"] }`
   - A coluna "PRIORIZADO" passa a ter apenas `statuses: ["priorizado"]`

2. **Ajustar grid de 4 para 5 colunas**: `grid-cols-5`

3. **Ajustar headers de fase**:
   - Fase 1 (Triagem): span 2 colunas (Levantado + Aprovado)
   - Fase 2 (Execução): span 3 colunas (Priorizado + Em Execução + Entregue)

4. **Ajustar seção "Não Aprovados"** para usar `grid-cols-5`

### `BacklogCard.tsx`

5. **Adicionar badge de status** no card para distinguir visualmente "aprovado" vs "priorizado":
   - Badge verde claro para "aprovado"
   - Badge roxo/indigo para "priorizado"
   - Aparece apenas para esses dois status (nos demais não é necessário pois a coluna já indica)

### Correção de build

6. Corrigir o erro do `mux-embed` workspace dependency que está impedindo o build

## Resumo de arquivos

| Arquivo | Alteração |
|---|---|
| `BacklogKanban.tsx` | Nova coluna "Aprovado", grid 5 colunas, headers de fase ajustados |
| `BacklogCard.tsx` | Badge de status para aprovado/priorizado |

