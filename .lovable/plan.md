

# ContextStrip — banner de contexto abaixo do WelcomeHeader

## O que será feito

Criar `src/components/dashboard/ContextStrip.tsx` e inseri-lo no Dashboard logo após o `<WelcomeHeader />`, sem alterar nenhum componente existente.

## Novo componente: `ContextStrip.tsx`

### Dados e hooks utilizados

| Plano | Hooks | KPIs |
|---|---|---|
| **Business** | `useUserRole`, `useEffectivePlan`, `useUserProfile`, `useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`, `useTasksByUser`, `useMentoriaSessoes` | % etapas concluídas (ROADMAP), tarefas alta/critica pendentes (CRÍTICAS), dia da próxima sessão (PRÓX. SESSÃO) |
| **Academy** | `useMinhaEvolucao` (totalVideos semanal — já existe no `WeeklyProgressCard` query, mas usaremos query inline similar), `useTrilhasEmAndamento`, `VitrineConquistas` pattern (conquistas = certificados emitidos + sequência + ferramentas desbloqueadas) | Módulos esta semana (ESTA SEMANA), trilhas em andamento (EM ANDAMENTO), total conquistas (CONQUISTAS) |
| **Skills** | `useSkillsMembro`, `useSkillsEntregas` | Membros equipe (EQUIPE — query simples `membros_equipe_skills`), entregas pendentes (PENDENTES), % concluídas (PROGRESSO) |
| **Visitante/null** | Apenas nome + semana, sem KPIs nem botão | — |

### Lógica

- `weekNumber` = semanas desde `profile.created_at` (min 1)
- `displayName` = nome ou email prefix ou "Usuário"
- `planoLabel` = mapa do effectivePlan
- KPIs calculados condicionalmente pelo plano efetivo, usando hooks existentes com `enabled` condicional
- Fallback `"—"` para qualquer valor undefined/null
- Nunca retorna `null` — sempre renderiza pelo menos a seção esquerda

### Detalhe dos KPIs

**Business:**
- KPI 1 (ROADMAP): `etapas.filter(e => e.status === 'concluida').length / etapas.length * 100` arredondado + "%"
- KPI 2 (CRÍTICAS): `tasks.filter(t => ['alta','urgente'].includes(t.prioridade) && t.status !== 'aprovado').length`
- KPI 3 (PRÓX. SESSÃO): próxima sessão futura com `status === 'agendada'`, formatada como dia da semana abreviado (`format(date, 'EEE', { locale: ptBR })`)

**Academy:**
- KPI 1 (ESTA SEMANA): query inline `progresso_videos` com `completado=true` e `updated_at >= 7 dias atrás`, count de `modulo_id` distintos
- KPI 2 (EM ANDAMENTO): `useTrilhasEmAndamento` → count de trilhas com progresso > 0 e < 100
- KPI 3 (CONQUISTAS): soma de conquistas desbloqueadas (mesma lógica da `VitrineConquistas` — certificados >= 1, sequência >= 7, vídeos >= 50, etc.)

**Skills:**
- KPI 1 (EQUIPE): query count `membros_equipe_skills` pela `equipeId` do membro
- KPI 2 (PENDENTES): `entregas.filter(e => e.status === 'pendente' || e.status === 'em_andamento').length`
- KPI 3 (PROGRESSO): `entregas concluídas / total * 100` + "%"

### Layout (inline styles conforme pedido)

- Container: `flex`, `items-center`, `justify-between`, dark bg (`#0C0F0A`), rounded, padding, border `white/10`
- Esquerda: nome (branco bold) + "Semana X · Plano" (muted)
- Direita: até 3 KPIs verticais (valor bold + label uppercase 11px) separados por dividers, + botão `#AFC040`

## Integração no Dashboard

**Arquivo editado**: `src/pages/Dashboard.tsx`

- Importar `ContextStrip`
- Adicionar `<ContextStrip />` imediatamente após `<WelcomeHeader />` (linha 81), tanto no bloco visitante quanto no bloco autenticado
- WelcomeHeader não é tocado

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/ContextStrip.tsx` | Novo |
| `src/pages/Dashboard.tsx` | Editado — adiciona import + componente |

