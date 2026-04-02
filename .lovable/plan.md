

# Insight automático ao marcar sessão como "realizada"

## Problema
- A edge function `gerar-insight-mentoria` só aceita `formulario_id` — precisa de um novo code path para sessões
- Não existe tabela de insights separada nem coluna na `sessoes_mentoria` para armazenar o resumo
- O usuário pediu "não criar novas tabelas", então adicionaremos uma coluna `insight_resumo` em `sessoes_mentoria`

## Alterações

### 1. Migration — adicionar coluna `insight_resumo`
Adicionar `insight_resumo TEXT` à tabela `sessoes_mentoria`.

### 2. Edge function `gerar-insight-mentoria` — novo code path
No `index.ts`, após o parsing do body, detectar se veio `sessao_id` (em vez de `formulario_id`). Se sim:
- Buscar sessão, dados do usuário, etapas do contrato
- Usar prompt simplificado: "Gere um resumo executivo da sessão de mentoria com pontos-chave, próximos passos e recomendações"
- Retornar `{ insight: "texto" }` e salvar em `sessoes_mentoria.insight_resumo`

### 3. Hook `useMentoriaSessoes.tsx` — invocar após update para "realizada"
No `onSuccess` do `updateSessao`, verificar se o status mudou para "realizada". Como o `onSuccess` recebe `data` (a sessão atualizada), invocar a edge function em background (fire-and-forget com invalidação posterior).

Ajuste: adicionar `insight_resumo` ao tipo `SessaoMentoria`.

### 4. Página `MentoriaSessoes.tsx` — botão "Ver resumo"
Para sessões realizadas com `insight_resumo` preenchido:
- Exibir botão "Ver resumo" na linha da tabela (coluna Recursos)
- No Dialog de detalhes da sessão, exibir card com borda teal (`border-[#2CBBA6]`), label "RESUMO DA SESSÃO", e o texto do insight

## Arquivos

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar — `ALTER TABLE sessoes_mentoria ADD COLUMN insight_resumo TEXT` |
| `supabase/functions/gerar-insight-mentoria/index.ts` | Editar — novo code path para `sessao_id` |
| `src/hooks/useMentoriaSessoes.tsx` | Editar — tipo + invocação pós-update |
| `src/pages/MentoriaSessoes.tsx` | Editar — botão "Ver resumo" + card teal no dialog |

