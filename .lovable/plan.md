

# Adicionar ProximosPassosCard ao simulador de onboarding

## Problema
O fluxo "Simular Onboarding" no AdminViewSelector executa apenas vídeo → tour, mas não mostra o card de Próximos Passos (que aparece após o tour). O admin não consegue visualizar essa etapa na simulação.

## Solução
Expandir o estado `onboardingStep` para incluir uma terceira etapa `'proximos_passos'`, que renderiza o `ProximosPassosCard` em modo preview (sem gravar no localStorage/banco).

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/ProximosPassosCard.tsx` | Editar — adicionar prop `previewMode` que força exibição e desativa persistência |
| `src/components/admin/AdminViewSelector.tsx` | Editar — adicionar etapa `'proximos_passos'` no fluxo de simulação |

## Detalhes

### ProximosPassosCard.tsx
- Nova prop opcional `previewMode?: boolean` e `onClose?: () => void`
- Quando `previewMode=true`: ignora checagem de `primeiro_acesso` e localStorage, exibe direto (`setMostrar(true)`)
- No `handleClose` com `previewMode`: chama `onClose()` em vez de gravar no localStorage/tracking

### AdminViewSelector.tsx
- Tipo do state: `'idle' | 'video' | 'tour' | 'proximos_passos'`
- Quando tour completa: `setOnboardingStep('proximos_passos')` em vez de `'idle'`
- Renderizar `ProximosPassosCard` quando step === `'proximos_passos'`, com `previewMode` e `onClose={() => setOnboardingStep('idle')}`

