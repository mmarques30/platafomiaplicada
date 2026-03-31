

# Melhorias visuais na plataforma

## 1. Glassmorphism no card de login
**Arquivo: `src/pages/Auth.tsx`** (linha 74)
- O card já tem `bg-black/45 backdrop-blur-md border border-white/10`. Ajustar para glassmorphism mais refinado: `bg-white/5 backdrop-blur-[8px] border border-white/15 shadow-xl shadow-black/20`

## 2. Gradient sutil no header do Dashboard
**Arquivo: `src/components/dashboard/WelcomeHeader.tsx`** (linha 54)
- Substituir `bg-[#0D0D0D]` por `bg-gradient-to-r from-[#0C0F0A] via-[#151814] to-[#0C0F0A]`

## 3. Micro-animação hover nos cards do Dashboard
**Arquivo: `src/index.css`**
- Adicionar classe utilitária `.card-micro-hover` com `transform: scale(1.02)` + sombra elevada no hover, `transition: all 0.2s ease`

**Arquivos: `src/components/dashboard/CentralConteudo.tsx`, `NovidadesSemana.tsx`, `WeeklyProgressCard.tsx`**
- Aplicar a classe nos cards principais

## 4. Progress bar de onboarding no perfil
**Arquivo: `src/pages/Configuracoes.tsx`**
- Adicionar card "Progresso do Perfil" no topo
- Calcular % com base em: nome preenchido, avatar definido, senha alterada (não temporária), tour concluído (`primeiro_acesso === false`), dados de onboarding preenchidos (query em `user_onboarding_responses`)
- Usar o componente `Progress` existente com animação de largura via CSS transition
- Exibir checklist visual dos itens completos/pendentes

## 5. Avatar com iniciais
**Novo componente: `src/components/shared/UserAvatar.tsx`**
- Props: `name`, `avatarUrl`, `size` (sm/md/lg)
- Se `avatarUrl` existe, renderiza `<img>`
- Senão, extrai as 2 primeiras iniciais do nome, exibe em círculo com `bg-primary text-white font-semibold`
- Tamanhos: sm=8, md=10, lg=14

**Aplicar em:**
- `src/components/layout/AppSidebar.tsx` (se houver avatar no footer/header do sidebar)
- `src/pages/Configuracoes.tsx` (topo do perfil)

## Arquivos alterados
- `src/pages/Auth.tsx` (glassmorphism)
- `src/components/dashboard/WelcomeHeader.tsx` (gradient)
- `src/index.css` (classe card-micro-hover)
- `src/components/dashboard/CentralConteudo.tsx` (hover class)
- `src/components/dashboard/NovidadesSemana.tsx` (hover class)
- `src/components/dashboard/WeeklyProgressCard.tsx` (hover class)
- `src/pages/Configuracoes.tsx` (progress bar onboarding + avatar)
- `src/components/shared/UserAvatar.tsx` (novo)

