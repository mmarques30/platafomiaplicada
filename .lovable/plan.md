

# Tela de primeiro acesso para Business Parceria e Sistemas

## Abordagem
Criar uma nova página `BusinessWelcome.tsx` e interceptar o fluxo no `MainLayout.tsx` para redirecionar usuários Business com `primeiro_acesso = true` para essa tela antes de acessar a plataforma.

## 1. Nova página: `src/pages/BusinessWelcome.tsx`
- Layout centralizado com `bg-background`
- Logo `logo-aplicada-nova.png` centralizado no topo
- Título dinâmico com nome do perfil (28px, weight 500)
- Subtítulo muted (15px)
- 3 itens numerados com borda esquerda 3px `#2CBBA6`
- Botão "Entrar na plataforma" (`#AFC040` bg, `#0C0F0A` texto)
- Ao clicar: `supabase.from("profiles").update({ primeiro_acesso: false })` + `navigate("/mentoria")`

## 2. Rota: `src/App.tsx`
- Adicionar rota `/welcome-business` como rota protegida fora do `MainLayout` (similar a `/onboarding-welcome`)

## 3. Redirecionamento: `src/components/layout/MainLayout.tsx`
- No `useEffect` existente, adicionar check: se `profile.primeiro_acesso === true` e `plano_mentoria` é `business_parceria` ou `business_sistemas`, redirecionar para `/welcome-business`

## Arquivos
- **Novo**: `src/pages/BusinessWelcome.tsx`
- **Editados**: `src/App.tsx` (1 rota), `src/components/layout/MainLayout.tsx` (1 useEffect)

