

# Fluxo Completo de Projetos no Backlog

## Entendimento

O ciclo de vida de um projeto no backlog tem duas fases:

```text
FASE 1: TRIAGEM (avaliar o que fazer com o projeto)

  Projeto Levantado
         |
    [AVALIACAO]
         |
         +---> Aprovado -------> segue para Fase 2
         +---> Nao Aprovado ---> rejeitado (secao separada)
         +---> Manter Backlog --> aguarda reavaliacao futura

FASE 2: EXECUCAO (pipeline do projeto aprovado)

  Aprovado --> Priorizado --> Em Execucao --> Entregue
```

Os status completos no banco serao:
- `levantado` - novo, aguardando triagem
- `aprovado` - avaliado e aceito
- `nao_aprovado` - rejeitado
- `backlog` - mantido para depois
- `priorizado` - aprovado e priorizado para execucao
- `em_execucao` - em andamento
- `entregue` - concluido/entregue

## Alteracoes

### 1. Migracao no banco de dados

Atualizar o check constraint para incluir todos os status:

```sql
ALTER TABLE backlog_skills DROP CONSTRAINT IF EXISTS backlog_skills_status_check;
ALTER TABLE backlog_skills ADD CONSTRAINT backlog_skills_status_check
  CHECK (status IN (
    'levantado', 'aprovado', 'nao_aprovado', 'backlog',
    'priorizado', 'em_execucao', 'entregue'
  ));
```

Tambem corrigir o erro de build do `mux-embed` (workspace dependency nao encontrada).

### 2. Kanban reorganizado (`BacklogKanban.tsx`)

Manter as 4 colunas principais do pipeline de execucao, mas agora com o fluxo correto:

| Coluna | Status incluidos | Significado |
|---|---|---|
| LEVANTADO | `levantado` + `backlog` | Projetos novos e mantidos para depois |
| PRIORIZADO | `aprovado` + `priorizado` | Aprovados e priorizados |
| EM EXECUCAO | `em_execucao` | Em andamento |
| ENTREGUE | `entregue` | Concluidos |

Projetos `nao_aprovado` continuam na secao separada abaixo.

### 3. Modal de detalhes (`ProjetoDetailModal.tsx`)

Mostrar botoes de acao **contextuais** conforme o status atual:

- **Se `levantado` ou `backlog`**: Botoes "Aprovar", "Nao Aprovar", "Manter no Backlog"
- **Se `aprovado`**: Botao "Priorizar" (muda para `priorizado`)
- **Se `priorizado`**: Botao "Iniciar Execucao"
- **Se `em_execucao`**: Botao "Marcar como Entregue"
- **Se `nao_aprovado`**: Botao "Reabrir"

Manter tambem o select manual com todos os status para flexibilidade.

Atualizar os mapas de labels e cores para incluir os novos status (`aprovado`, `backlog`).

### 4. Tabela (`BacklogTable.tsx`)

Atualizar labels e cores para incluir os novos status.

### 5. Filtros (`BacklogView.tsx`)

Nenhuma alteracao necessaria nos filtros (ja filtram por responsavel, prioridade e area).

## Resumo de arquivos

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Check constraint com 7 status + fix mux-embed |
| `BacklogKanban.tsx` | Agrupar status nas 4 colunas corretas |
| `ProjetoDetailModal.tsx` | Botoes contextuais por fase + labels/cores novos status |
| `BacklogTable.tsx` | Labels e cores dos novos status |

