

# Fallback para YouTube não configurado no OnboardingVideo

## Alteração

**Arquivo**: `src/components/onboarding/OnboardingVideo.tsx`

1. Adicionar constante `VIDEO_CONFIGURADO` após `YOUTUBE_VIDEO_ID`
2. Substituir o bloco do iframe por condicional: se configurado mostra iframe, senão mostra placeholder com ícone "M" e texto

Nenhuma outra alteração — `handleEnter`, `useEffect`, `primeiro_acesso` e rodapé permanecem intactos.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/OnboardingVideo.tsx` | Editado — fallback condicional na área de vídeo |

