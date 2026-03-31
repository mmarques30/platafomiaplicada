

# DashboardCommandStrip — substituir WelcomeHeader para usuários com plano

## Visão geral

Criar um componente `DashboardCommandStrip` que substitui o `WelcomeHeader` no Dashboard para usuários com plano definido. Visitantes mantêm o `WelcomeHeader` original. O componente exibe nome + contexto da jornada à esquerda e KPIs + ação à direita, variando por plano.

## Novo componente: `src/components/dashboard/DashboardCommandStrip.tsx`

**Layout**: faixa horizontal, `bg-card border border-border rounded-xl`, padding `py-3.5 px-5`, flex row justify-between.

**Coluna esquerda**:
- Nome do usuário (17px, font-medium) via `useUserProfile`
- Subtexto 12px muted: "Semana X da sua jornada · [plano formatado]"
- Semana = `Math.ceil((now - profile.created_at) / 7 dias)`
- Plano formatado via mapa: `academy → "Academy"`, `business_parceria → "Business Parceria"`, `business_sistemas → "Business Sistemas"`, `skills → "Skills"`

**Coluna direita — condicional por plano** (usa `useUserPlan`):

1. **Business Parceria / Sistemas**: usa `useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`, `useTasksByUser`, `useMentoriaSessoes`
   - % roadmap = `(etapas concluídas / total etapas) * 100` — badge teal
   - Tarefas críticas (prioridade alta/urgente + pendente) — badge amber
   - Próxima sessão agendada (dia formatado)
   - Botão "Ver sessão" → `/mentoria/sessoes`

2. **Academy**: usa query `progresso_videos` (semana atual, completados) e módulos em andamento
   - Vídeos concluídos esta semana — badge teal
   - Módulos em andamento — badge muted
   - Botão "Continuar trilha" → `/trilhas`

3. **Skills**: usa `useSkillsEquipe` (membros ativos) e `useSkillsEntregas` (pendentes)
   - Membros ativos — badge teal
   - Entregas pendentes — badge amber
   - Botão "Ver equipe" → `/skills/equipe`

Cada KPI é um `<span>` inline com cor + texto compacto. Botão é `variant="outline" size="sm"`.

Quando dados ainda carregam, exibe skeleton inline (pulsing dots) nos KPIs.

## Editar: `src/pages/Dashboard.tsx`

- Import `DashboardCommandStrip`
- Na seção de não-visitantes (linha 80-82), substituir `<WelcomeHeader />` por `<DashboardCommandStrip />`
- Manter `<WelcomeHeader />` inalterado no bloco de visitantes (linha 50)

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/DashboardCommandStrip.tsx` | Novo |
| `src/pages/Dashboard.tsx` | Editado — troca WelcomeHeader por DashboardCommandStrip para não-visitantes |

Nenhum outro componente alterado. Nenhuma migration necessária.

