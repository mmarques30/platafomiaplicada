

# Remover emojis decorativos dos componentes

Substituir todos os emojis decorativos por ícones Lucide, mantendo emojis que fazem parte de botões/selects interativos.

## Alterações

### 1. `src/components/mentoria/AcademyRoadmapEducacional.tsx` (linha 234)
- `🎉 Todas as trilhas concluídas!` → Usar `<CheckCircle2>` (já importado)

### 2. `src/pages/OnboardingWelcome.tsx` (linha 70)
- `👋` no título de boas-vindas → Remover

### 3. `src/components/dashboard/DashboardTour.tsx` (linhas 12, 19, 25, 31, 37)
- `📚 Trilha Recomendada` → `Trilha Recomendada`
- `📅 Calendário` → `Calendário`
- `🤖 MarIAna — Sua Assistente` → `MarIAna — Sua Assistente`
- `📈 Sua Evolução` → `Sua Evolução`
- `⚙️ Configurações` → `Configurações`

### 4. `src/components/mentoria/business/IAplicadaVisaoGeral.tsx` (linha 68)
- `🚧` → Ícone `<Construction>` do Lucide

### 5. `src/components/mentoria/business/IAplicadaRoadmap.tsx` (linha 94)
- `🚧` → Ícone `<Construction>` do Lucide

### 6. `src/components/mentoria/business/BusinessEvolucaoAprendizado.tsx` (linha 207)
- `⭐ Favoritos` — **manter** (é item de select interativo, funciona como botão)

## Arquivos editados
5 arquivos, nenhum novo.

