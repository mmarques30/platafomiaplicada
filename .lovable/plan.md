

# Simulação completa do Onboarding

## Problema
O "Simular Onboarding" só mostra o overlay de vídeo. Não exibe o tour guiado (DashboardTour) nem o modal de troca de senha — o admin vê a página como se o usuário já tivesse completado tudo.

## Solução
Expandir a simulação para reproduzir os 3 passos em sequência:
1. **Vídeo de boas-vindas** → ao clicar "Entrar na plataforma"…
2. **Tour guiado** (react-joyride) → ao concluir/pular…
3. Fim da simulação

O modal de senha será excluído da simulação (requer lógica de auth real, pouco valor visual).

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/admin/AdminViewSelector.tsx` | Editar — gerenciar estado `onboardingStep` (video → tour → done) |
| `src/components/dashboard/DashboardTour.tsx` | Editar — aceitar prop `previewMode` para rodar sem alterar banco |
| `src/components/onboarding/OnboardingVideo.tsx` | Sem alteração (já suporta `previewMode`) |

## Detalhes técnicos

### AdminViewSelector.tsx
- Substituir `showOnboardingPreview` por `onboardingStep: 'idle' | 'video' | 'tour'`
- Ao clicar "Simular Onboarding": `setOnboardingStep('video')`
- `OnboardingVideo` com `onClose={() => setOnboardingStep('tour')}`
- `DashboardTour` com `previewMode` e `onComplete={() => setOnboardingStep('idle')}`

### DashboardTour.tsx
- Adicionar props `previewMode?: boolean` e `onComplete?: () => void`
- Se `previewMode`: pular a chamada `supabase.update({ primeiro_acesso: false })` e chamar `onComplete?.()` no final
- Renderizar condicionalmente: se `previewMode`, sempre mostrar (ignorar check de `primeiro_acesso`)

