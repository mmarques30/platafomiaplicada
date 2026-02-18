

# Separacao Visual das Fases no Kanban

## Situacao atual

O Kanban mostra 4 colunas lado a lado sem indicacao de qual fase cada uma pertence. O usuario nao consegue distinguir visualmente a **Fase 1 (Triagem)** da **Fase 2 (Execucao)**.

## Solucao

Adicionar labels de fase acima das colunas do Kanban, criando uma separacao visual clara:

```text
|--- TRIAGEM ---|------------ EXECUCAO --------------|
| LEVANTADO     | PRIORIZADO | EM EXECUCAO | ENTREGUE |
```

### Alteracao em `BacklogKanban.tsx`

- Adicionar uma linha de headers acima das colunas com dois grupos:
  - **Triagem** (span 1 coluna): cobre a coluna "Levantado"
  - **Execucao** (span 3 colunas): cobre "Priorizado", "Em Execucao", "Entregue"
- Cada label tera um estilo sutil (texto pequeno, cor discreta, com um separador vertical entre as fases)
- Tambem corrigir o erro de build do `mux-embed`

### Correcao de build

Remover ou corrigir a referencia ao pacote `mux-embed` no `package.json` que esta causando o erro de workspace dependency.

## Resumo de arquivos

| Arquivo | Alteracao |
|---|---|
| `BacklogKanban.tsx` | Labels de fase "Triagem" e "Execucao" acima das colunas |
| `package.json` | Corrigir referencia ao `mux-embed` (se existir) |

