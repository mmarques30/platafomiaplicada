

# Corrigir conflito de primeiro_acesso no onboarding Academy

## Problema
`OnboardingVideo` seta `primeiro_acesso = false` no banco ao fechar, impedindo o `DashboardTour` de rodar (pois ele verifica `primeiro_acesso === true`).

## Alterações

### 1. `src/components/onboarding/OnboardingVideo.tsx`
- Remover a chamada `supabase.update({ primeiro_acesso: false })` do `handleEnter`
- Remover imports não mais necessários (`supabase`, `useQueryClient`)
- No `handleEnter`, apenas salvar `sessionStorage.setItem('onboarding_video_visto', 'true')` e `setVisible(false)`

### 2. `src/components/dashboard/DashboardTour.tsx`
- Alterar a prop `run` para internamente também checar `sessionStorage.getItem('onboarding_video_visto') === 'true'`
- Manter o `onEvent` que seta `primeiro_acesso = false` no Supabase ao finalizar/pular o tour (já existe)

### 3. `src/pages/Dashboard.tsx`
- Atualizar `showTour` para incluir a condição do sessionStorage:
  ```
  profile?.primeiro_acesso === true && sessionStorage.getItem('onboarding_video_visto') === 'true'
  ```
- Usar `useState` para reagir ao sessionStorage (já que sessionStorage não é reativo, o OnboardingVideo overlay desaparecendo causa re-render que lê o valor atualizado)

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/OnboardingVideo.tsx` | Editado — remove update do banco, usa sessionStorage |
| `src/components/dashboard/DashboardTour.tsx` | Sem alteração (já seta primeiro_acesso = false ao fim) |
| `src/pages/Dashboard.tsx` | Editado — showTour inclui check do sessionStorage |

