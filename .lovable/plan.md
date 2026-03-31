

# Onboarding Inteligente com MarIAna

## Resumo
Três funcionalidades: (1) tela de boas-vindas pós-signup com recomendação de ambiente, (2) tour guiado no Dashboard no primeiro acesso, (3) card semanal de progresso com recomendação.

---

## 1. Tela de boas-vindas com MarIAna pós-signup

**Nova página: `src/pages/OnboardingWelcome.tsx`**
- Tela fullscreen estilo dark com avatar da MarIAna e mensagem personalizada
- Recebe dados do signup via `sessionStorage` (nome, objetivo, area_atuacao salvos no SignupForm após cadastro)
- Lógica de recomendação local (sem chamada de IA): mapeia objetivo → ambiente sugerido
  - `desenvolver_habilidades_ia` → Academy
  - `melhorar_produtividade_time` → Skills
  - `organizar_operacao` → Business
  - `explorando` → Gratuito
- Exibe mensagem: "Olá, [nome]! Sou a MarIAna. Com base no seu perfil, recomendo começar pelo [ambiente]. Mas você pode explorar qualquer ambiente quando quiser."
- Botão "Continuar" → navega para `/selecionar-ambiente`

**Alterações em `src/components/auth/SignupForm.tsx`**
- Após signup bem-sucedido, salvar `nome`, `objetivo`, `area_atuacao` no `sessionStorage`

**Alterações em `src/pages/Auth.tsx`**
- No redirect pós-login, verificar flag `sessionStorage.getItem("onboarding_complete")`. Se ausente (novo cadastro), ir para `/onboarding-welcome`; se presente, manter fluxo atual

**Alterações em `src/App.tsx`**
- Adicionar rota `/onboarding-welcome` → `OnboardingWelcome`

---

## 2. Tour guiado com react-joyride no Dashboard

**Instalar dependência: `react-joyride`**

**Novo componente: `src/components/dashboard/DashboardTour.tsx`**
- Usa `react-joyride` com 5 steps targeting elementos por `data-tour` attributes:
  1. `[data-tour="trilha-recomendada"]` — Trilha recomendada
  2. `[data-tour="calendario"]` — Calendário (link no sidebar)
  3. `[data-tour="mariana-button"]` — Botão flutuante da MarIAna
  4. `[data-tour="evolucao"]` — Seção de evolução (link no sidebar)
  5. `[data-tour="configuracoes"]` — Configurações
- Estilo dark com cores da plataforma (verde #9EB038)
- Callback `onFinish`: chama `supabase.from('profiles').update({ primeiro_acesso: false })` e invalida query

**Alterações em `src/pages/Dashboard.tsx`**
- Importar `DashboardTour`, renderizar condicionalmente quando `profile?.primeiro_acesso === true && !isVisitante`
- Adicionar `data-tour` attributes nos elementos relevantes (WelcomeHeader, CentralConteudo, etc.)

**Alterações em `src/components/shared/MarIAnaFloatingButton.tsx`**
- Adicionar `data-tour="mariana-button"` ao botão

---

## 3. Card semanal de progresso + recomendação

**Novo componente: `src/components/dashboard/WeeklyProgressCard.tsx`**
- Verifica `localStorage` por chave `last_weekly_card_shown` com timestamp da última exibição
- Se diferença > 7 dias (ou nunca mostrado), exibe o card
- Busca dados: vídeos concluídos na última semana (`progresso_videos` com `updated_at` >= 7 dias atrás), trilhas em andamento
- Exibe: "Na última semana você concluiu X vídeos. Continue com [trilha em andamento]!"
- Botão "Fechar" atualiza `localStorage` com timestamp atual
- Card com estilo consistente: fundo escuro, borda verde, ícone da MarIAna

**Alterações em `src/pages/Dashboard.tsx`**
- Renderizar `WeeklyProgressCard` entre `WelcomeHeader` e `PendenciasOnboarding` (apenas para não-visitantes)

---

## Arquivos criados
- `src/pages/OnboardingWelcome.tsx`
- `src/components/dashboard/DashboardTour.tsx`
- `src/components/dashboard/WeeklyProgressCard.tsx`

## Arquivos alterados
- `src/components/auth/SignupForm.tsx` (salvar dados em sessionStorage)
- `src/pages/Auth.tsx` (redirect para onboarding-welcome)
- `src/App.tsx` (nova rota)
- `src/pages/Dashboard.tsx` (tour + weekly card + data-tour attrs)
- `src/components/shared/MarIAnaFloatingButton.tsx` (data-tour attr)
- `package.json` (react-joyride)

## Detalhes técnicos
- `primeiro_acesso` já existe no profile e é `true` para novos mentorados cadastrados pelo admin. Para visitantes (signup), será `null` — o tour só dispara para mentorados com `primeiro_acesso === true`. Para visitantes, podemos usar `sessionStorage` flag `tour_completed` para mostrar o tour uma vez.
- Recomendação de ambiente é determinística (mapa objetivo→ambiente), sem chamada de edge function.
- O card semanal usa `localStorage` para controle de exibição — simples e sem necessidade de tabela extra.

