

# Notificações automáticas por triggers + integração no sino e página

## Resumo
Criar 4 triggers no banco para inserir notificações automaticamente quando o admin cria/atualiza entregas, tarefas, sessões e status de entregas. Integrar a tabela `notificacoes` no sino do header e na página de Notificações.

---

## 1. Migração SQL — 4 triggers

**Trigger 1: Nova entrega criada (`entregas_business` INSERT)**
- Resolve `user_id` via JOIN em `contratos_business`
- Insere: tipo `entrega`, titulo `Nova entrega: [titulo]`, link `/mentoria`

**Trigger 2: Tarefa com prioridade alta/crítica (`tarefas_mentoria` INSERT + `tasks_business` INSERT)**
- Só dispara se `prioridade` IN ('alta', 'critica', 'urgente')
- Insere: tipo `tarefa`, titulo `Tarefa urgente adicionada: [titulo]`, link `/mentoria/tarefas`

**Trigger 3: Sessão agendada ou horário alterado (`sessoes_mentoria` INSERT + UPDATE de `data_sessao`)**
- Insere: tipo `sessao`, titulo `Sessão confirmada: [data formatada]`, link `/notificacoes/calendario`

**Trigger 4: Status de entrega atualizado (`entregas_business` UPDATE de `status`)**
- Só dispara se `OLD.status IS DISTINCT FROM NEW.status`
- Resolve `user_id` via `contratos_business`
- Insere: tipo `entrega`, titulo `Sua entrega "[titulo]" foi marcada como [status]`, link `/mentoria`

Todos os triggers usam `SECURITY DEFINER` para bypassar RLS na inserção em `notificacoes`.

---

## 2. Hook para notificações pessoais
**Novo arquivo: `src/hooks/useNotificacoesPessoais.tsx`**
- `useNotificacoesPessoais()` — busca `notificacoes` do user, ordenado por `created_at DESC`
- `useNotificacoesNaoLidas()` — count de `notificacoes` onde `lida = false`
- `useMarcarNotificacoesComoLidas()` — mutation que faz UPDATE `lida = true` nos IDs passados

---

## 3. Atualizar sino no header
**Arquivo: `src/components/layout/TopHeader.tsx`**
- Importar `useNotificacoesNaoLidas`
- Somar `avisosCount + notificacoesNaoLidasCount` no badge do sino

---

## 4. Atualizar página de Notificações
**Arquivo: `src/pages/Notificacoes.tsx`**
- Adicionar seção "Notificações" acima dos avisos, listando itens da tabela `notificacoes`
- Cada item mostra ícone por tipo (entrega/tarefa/sessão), título, mensagem, tempo relativo
- Items não lidos têm destaque visual (borda primária)
- Marcar como lidos ao carregar (como já faz com avisos)
- Manter a seção de Avisos existente abaixo

---

## Arquivos
- **Migração SQL**: 4 triggers + 4 funções
- **Novo**: `src/hooks/useNotificacoesPessoais.tsx`
- **Editados**: `TopHeader.tsx`, `Notificacoes.tsx`

