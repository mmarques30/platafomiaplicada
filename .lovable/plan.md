

# Substituir lista de cards por timeline vertical em MentoriaEtapasBusiness

## Alteração

**Arquivo**: `src/pages/MentoriaEtapasBusiness.tsx`

### Substituir bloco de lista (linhas 97-173)

Trocar o `div.space-y-4` com cards por um container `relative` com:
- Linha vertical absoluta (`absolute left-5 top-0 bottom-0 w-0.5 bg-border`)
- Cada etapa renderizada como `flex gap-4` com:
  - **Marcador circular** (40px, `z-10`): verde com `✓` se concluída, amber pulsante se em andamento, muted se pendente
  - **Card clicável** ao lado com:
    - Título + badge "você está aqui" se em andamento
    - Objetivo (descrição) se existir
    - Barra de progresso de instruções se em andamento e `stats.totalInstrucoes > 0`
    - Data de previsão se concluída
    - Stats de entregas/instruções

### Dados mantidos
Usa os mesmos `etapas`, `getEtapaStats()`, `statusConfig`, `navigate()` — zero alteração em hooks/queries.

### Nenhuma outra alteração — header, progresso geral card, empty state, imports, auth e roles permanecem intactos.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/MentoriaEtapasBusiness.tsx` | Editado — lista → timeline vertical |

