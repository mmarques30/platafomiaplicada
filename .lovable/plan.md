

# Fluxo de primeiro acesso Academy

## Resumo
Criar experiência direcionada para alunos Academy no primeiro acesso: card de boas-vindas no Dashboard + componente inteligente de próximo passo na Mentoria.

---

## 1. Card de boas-vindas no Dashboard (primeiro acesso)
**Novo componente: `src/components/dashboard/AcademyWelcomeCard.tsx`**
- Exibido apenas quando `profile.plano_mentoria === 'academy'` e `profile.primeiro_acesso === true`
- Texto: "Olá, [nome]! Por onde começar?"
- 3 botões de ação rápida:
  - "Ver minha primeira trilha" → `/trilhas` (primeira trilha disponível)
  - "Preencher meu diagnóstico" → `/diagnostico/formulario`
  - "Conhecer a plataforma" → dispara o tour (via callback)
- Botão de fechar (X) que chama `supabase.from('profiles').update({ primeiro_acesso: false })` e remove o card
- Estilo: card com borda verde, fundo escuro, ícones para cada ação

**Arquivo: `src/pages/Dashboard.tsx`**
- Importar `AcademyWelcomeCard`
- Renderizar entre `WelcomeHeader` e `WeeklyProgressCard` quando `profile.plano_mentoria === 'academy'` e `profile.primeiro_acesso === true`
- Ao fechar o card, invalidar query do profile

---

## 2. Componente AcademyProximoPasso (substituir NavegacaoRapida)
**Novo componente: `src/components/mentoria/AcademyProximoPasso.tsx`**
- Lógica condicional em 3 níveis:
  1. Se diagnóstico não preenchido (query em `formulario_diagnostico` onde `completado = true`) → card com CTA "Preencher diagnóstico" + link `/diagnostico/formulario`
  2. Se diagnóstico preenchido mas sem trilha iniciada → card "Trilha recomendada" + link para primeira trilha
  3. Se trilha iniciada → busca último vídeo não concluído em `progresso_videos` → card "Continue de onde parou" + link para aula

**Arquivo: `src/pages/Mentoria.tsx`**
- Na seção Academy (linhas 112-122), substituir `<NavegacaoRapida />` por `<AcademyProximoPasso />`
- Manter `PendenciasUrgentes`, `StatusDiagnostico`, `ProximaSessao` e `TarefasUrgentes`

---

## 3. Lógica de fechamento do card
- O botão X do `AcademyWelcomeCard` faz `update profiles set primeiro_acesso = false` e invalida a query `user-profile`
- O card não aparece mais após fechamento (reativo via react-query)

## Arquivos
- **Novos**: `AcademyWelcomeCard.tsx`, `AcademyProximoPasso.tsx`
- **Editados**: `Dashboard.tsx`, `Mentoria.tsx`

