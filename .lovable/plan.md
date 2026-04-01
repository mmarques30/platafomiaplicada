

# Criar OnboardingVideo.tsx

## Ajustes necessários no código fornecido

O hook `useProfile` não existe no projeto. O hook correto é `useUserProfile` de `@/hooks/useUserProfile`. Além disso, ele não expõe `refetch` — será necessário usar `useQueryClient` para invalidar a query `["user-profile"]`.

## Arquivo novo: `src/components/onboarding/OnboardingVideo.tsx`

Criar com o código fornecido pelo usuário, mas com estas correções:

1. **Import**: `useProfile` → `useUserProfile` de `@/hooks/useUserProfile`
2. **Import adicional**: `useQueryClient` de `@tanstack/react-query`
3. **Dentro do componente**: `const { profile, refetch } = useProfile()` → `const { profile } = useUserProfile()` + `const queryClient = useQueryClient()`
4. **No `handleEnter`**: `await refetch()` → `queryClient.invalidateQueries({ queryKey: ["user-profile"] })`
5. **Guard**: `profile.id` → `profile?.id` (profile pode ser null)
6. O JSX do código ficou truncado na mensagem — o overlay container e o iframe do YouTube precisam ser reconstruídos com base no padrão visual descrito (fundo escuro semi-transparente, card centralizado com iframe YouTube + texto + botões)

### Constante do vídeo
Manter `YOUTUBE_VIDEO_ID = 'SUBSTITUIR_PELO_ID_DO_VIDEO'` como placeholder.

### Nenhum outro arquivo alterado.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/OnboardingVideo.tsx` | Novo |

