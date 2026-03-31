

# Integrar MarIAna ao contexto da área de mentoria

## Resumo
Quando o chat flutuante for aberto em páginas `/mentoria/*`, buscar dados contextuais do mentorado (entregas, sessões, etapas, tarefas críticas) e enviá-los ao edge function, que os injeta no system prompt. A MarIAna inicia com mensagem proativa baseada nas pendências. Fora de `/mentoria/*`, comportamento inalterado.

## Alterações

### 1. Frontend — `MarIAnaChatDrawer.tsx`
- Importar `useLocation` e `useBusinessUserId`
- Detectar `isMentoriaContext = location.pathname.startsWith("/mentoria")`
- Quando `isMentoriaContext`, ao montar, buscar do Supabase:
  - Próxima entrega pendente: `entregas_business` via `contratos_business` (WHERE status != 'concluida', ORDER BY prazo ASC, LIMIT 1)
  - Próxima sessão agendada: `sessoes_mentoria` (WHERE status = 'agendada' AND data_sessao > now(), ORDER BY data_sessao ASC, LIMIT 1)
  - Etapa atual: `etapas_business` via contrato (WHERE status = 'em_andamento', LIMIT 1)
  - Tarefas críticas: `tarefas_mentoria` (WHERE prioridade IN ('alta','critica','urgente') AND status != 'concluida', count)
- Montar objeto `mentoriaContext` com esses dados
- Passar `mentoriaContext` no body do fetch para `ai-chat-user`
- Ao abrir em `/mentoria/*` sem histórico prévio, em vez de mostrar sugestões genéricas, mostrar sugestões contextuais baseadas nas pendências (ex: "Revisar minha próxima entrega", "Preparar para a sessão de amanhã")

### 2. Frontend — `Chat.tsx` (tela completa)
- Mesma lógica: detectar se veio de `/mentoria/*` via `location` e enviar `mentoriaContext` no body

### 3. Edge Function — `ai-chat-user/index.ts`
- Extrair `mentoriaContext` do request body (opcional)
- Se presente, adicionar bloco ao system prompt após o contexto Business existente:

```
## 📋 Contexto Mentoria Atual:
- Próxima entrega: "[titulo]" — prazo em X dias
- Próxima sessão: DD/MM/YYYY às HH:MM
- Etapa atual: "[nome]" (X% progresso)
- Tarefas críticas em aberto: N

INSTRUÇÃO: Na primeira mensagem, inicie proativamente:
- Se entrega vence em ≤3 dias: "Sua próxima entrega '[titulo]' vence em X dias. Quer revisar?"
- Se sessão em ≤24h: "Sua sessão é amanhã. Tem algo que quer preparar?"
- Se tarefas críticas > 0: "Você tem N tarefas críticas. Quer ver o que está pendente?"
- Se nada urgente: "Olá, [nome]. Como posso te ajudar hoje?"
```

## Detalhe técnico
- O `mentoriaContext` é enviado como campo opcional no body JSON — não quebra chamadas existentes
- Queries usam `useBusinessUserId()` para suportar admin impersonando Business
- Nenhuma migração SQL — dados já existem nas tabelas

## Arquivos
- **Editados**: `MarIAnaChatDrawer.tsx`, `Chat.tsx`, `ai-chat-user/index.ts`

