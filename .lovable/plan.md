

# DashboardUrgencias — banner compacto de urgência

## O que será feito

Criar um componente `DashboardUrgencias` que aparece entre `WelcomeHeader` e `WeeklyProgressCard` apenas quando houver 1 item urgente. Exibe um banner horizontal compacto (max 48px) com borda esquerda coral e link de ação.

## Lógica de prioridade (primeiro encontrado = exibido)

1. **Sessão em 24h** (Business) — `useMentoriaSessoes`: filtra sessões com `data_sessao` nas próximas 24h e `link_meet` preenchido. Ação: "Acessar sessão" → link_meet.
2. **Tarefa vencendo em 48h** (Academy) — `useMentoriaTarefas`: filtra tarefas com `prazo_entrega` ≤ 48h e status `pendente`/`em_andamento`. Ação: "Ver tarefa" → `/mentoria/tarefas`.
3. **Tarefa vencendo em 48h** (Business) — `useTasksByUser`: filtra tasks com `prazo` ≤ 48h e status `pendente`. Ação: "Ver tarefa" → `/mentoria/tarefas-business`.
4. **Diagnóstico não preenchido** (Academy) — `useMentoriaForm`: se `formulario` é `null` ou `completado === false`. Ação: "Preencher diagnóstico" → `/meu-diagnostico`.

## Componente

**Novo arquivo**: `src/components/dashboard/DashboardUrgencias.tsx`

- Usa hooks existentes (`useMentoriaTarefas`, `useTasksByUser`, `useMentoriaSessoes`, `useMentoriaForm`, `useUserPlan`)
- Calcula o item mais urgente via `useMemo`
- Se nenhum item urgente → retorna `null`
- Renderiza: `div` com `border-l-4 border-[#E8684A]`, `bg-card`, `h-12`, `flex items-center justify-between`, texto descritivo + `Link` de ação
- Condiciona queries Business somente se `isBusiness`, evitando fetches desnecessários para Academy

## Integração no Dashboard

**Editado**: `src/pages/Dashboard.tsx`

- Importar `DashboardUrgencias`
- Inserir `<DashboardUrgencias />` entre `<WelcomeHeader />` e `<WeeklyProgressCard />` (após linha 81, antes de linha 89)
- Sem alteração em nenhum outro componente

