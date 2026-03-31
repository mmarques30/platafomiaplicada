

# Integrar contexto de mentoria ao chat da MarIAna

## Visão geral

Quando o chat da MarIAna abre em páginas `/mentoria/*`, buscar dados de urgência do usuário (entregas, sessões, etapas, tarefas críticas), gerar uma mensagem proativa como primeira mensagem da assistente, e enviar contexto extra ao `ai-chat-user` para personalizar as respostas.

A edge function `personalizar-instrucao` **não será usada** — ela é voltada para gerar descrições de instruções de etapas, não para chat. O contexto será montado no cliente e enviado como campo extra ao `ai-chat-user`, que já possui system prompt completo.

## Arquitetura

```text
MarIAnaChatDrawer
  ├─ useLocation() → detecta /mentoria/*
  ├─ useMentoriaContext() [novo hook]
  │   ├─ useContratosBusiness(businessUserId)
  │   ├─ useEntregasBusiness(contratoId)
  │   ├─ useMentoriaSessoes(businessUserId)
  │   ├─ useEtapasBusiness(contratoId)
  │   └─ useTasksByUser(userId)
  │   → retorna { proximaEntrega, proximaSessao, etapaAtual, tarefasCriticas, contextText }
  ├─ Mensagem proativa (se urgência + /mentoria/*)
  └─ sendMessage → envia mentoria_context ao ai-chat-user
```

## Alterações

### 1. Novo hook: `src/hooks/useMentoriaContext.tsx`

- Aceita `enabled: boolean` para evitar fetches fora de `/mentoria/*`
- Usa hooks existentes (`useBusinessUserId`, `useContratosBusiness`, `useEntregasBusiness`, `useMentoriaSessoes`, `useEtapasBusiness`, `useTasksByUser`)
- Calcula:
  - Próxima entrega pendente com prazo (ordenada por prazo)
  - Próxima sessão agendada (data futura mais próxima)
  - Etapa atual (status `em_andamento`)
  - Contagem de tarefas com prioridade `critica` ou `urgente`
- Retorna um `contextText` (string) com resumo para o system prompt e um `proactiveMessage` (string | null) baseado na prioridade:
  1. Sessão em < 24h → "Sua próxima sessão é amanhã..."
  2. Entrega em < 3 dias → "Sua próxima entrega vence em X dias..."
  3. Tarefas críticas → "Você tem X tarefa(s) crítica(s)..."
  4. Nenhuma urgência → `null`

### 2. Editar `src/components/shared/MarIAnaChatDrawer.tsx`

- Importar `useLocation` e `useMentoriaContext`
- Detectar `isMentoriaPage = pathname.startsWith("/mentoria")`
- Chamar `useMentoriaContext({ enabled: isMentoriaPage })`
- **Mensagem proativa**: Após carregar histórico, se `messages.length === 0` e `proactiveMessage` existe, inserir como primeira mensagem `{ role: "assistant", content: proactiveMessage }` (sem salvar no banco — é efêmera)
- **Contexto no request**: Ao chamar `ai-chat-user`, incluir `mentoria_context: contextText` no body JSON (apenas quando `isMentoriaPage`)

### 3. Editar `supabase/functions/ai-chat-user/index.ts`

- Extrair `mentoria_context` do request body (campo opcional)
- Se presente, concatenar ao final do system prompt como seção `## Contexto da Sessão Atual` com o texto recebido
- Nenhuma query adicional na edge function

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/hooks/useMentoriaContext.tsx` | Novo |
| `src/components/shared/MarIAnaChatDrawer.tsx` | Editado |
| `supabase/functions/ai-chat-user/index.ts` | Editado (aceitar campo `mentoria_context`) |

Nenhum outro componente alterado. Nenhuma migration necessária.

