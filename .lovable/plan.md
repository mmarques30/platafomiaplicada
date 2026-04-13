

# Corrigir onboarding travado quando usuário não segue a ordem exata

## Problema

O onboarding tem uma cadeia sequencial rígida:

```text
OnboardingVideo → DashboardTour → ProximosPassosCard
```

Cada etapa depende da anterior ter sido concluída de forma específica:

1. **OnboardingVideo** — seta `sessionStorage('onboarding_video_visto')`
2. **DashboardTour** — só roda se `primeiro_acesso=true` E `sessionStorage` existe. Quando termina, seta `primeiro_acesso=false`
3. **ProximosPassosCard** — só aparece se `primeiro_acesso=false`

Se o usuário navega para o diagnóstico (ou qualquer outra página) **durante o tour**, o componente `DashboardTour` é desmontado sem disparar o evento `TOUR_END`. Isso significa que `primeiro_acesso` nunca vira `false`, e o **ProximosPassosCard nunca aparece**. O tour também re-inicia toda vez que volta ao Dashboard, mas pode falhar silenciosamente se os elementos do sidebar ainda não estiverem no DOM.

Adicionalmente, `useTrocarSenha` seta `primeiro_acesso: false` diretamente, pulando vídeo, tour e próximos passos completamente para usuários do webhook.

## Correção

### 1. DashboardTour — tratar unmount como tour concluído

**Arquivo**: `src/components/dashboard/DashboardTour.tsx`

Adicionar um `useEffect` de cleanup que, ao desmontar o componente (usuário navegou para outra página), marca o tour como concluído (`primeiro_acesso: false`). Isso desbloqueia o ProximosPassosCard.

### 2. useTrocarSenha — não setar `primeiro_acesso: false`

**Arquivo**: `src/hooks/useTrocarSenha.tsx`

Remover `primeiro_acesso: false` do update de troca de senha. A troca de senha deve apenas limpar `senha_temporaria`. O fluxo de onboarding (vídeo → tour → próximos passos) deve seguir seu próprio ciclo independente.

### 3. ProximosPassosCard — fallback para primeiro_acesso=true

**Arquivo**: `src/components/onboarding/ProximosPassosCard.tsx`

Relaxar a condição de exibição: mostrar também quando `primeiro_acesso=true` E o vídeo já foi visto E o tour já teve chance de rodar (sessionStorage tem flag de vídeo). Isso garante que mesmo que o tour falhe, o card aparece.

Condição atualizada:
```typescript
// Mostrar se:
// - primeiro_acesso=false (tour concluído normalmente) OU
// - primeiro_acesso=true E vídeo já visto (tour foi pulado/interrompido)
// E sem senha temporária pendente
// E não foi dismissado antes
const jaViuVideo = sessionStorage.getItem('onboarding_video_visto') === 'true';
if (
  profile?.senha_temporaria !== true &&
  !localStorage.getItem(chave) &&
  (profile?.primeiro_acesso === false || jaViuVideo)
) {
  setMostrar(true);
}
```

## Resultado esperado

- Usuário pode explorar livremente após o vídeo sem ficar preso
- Tour aparece quando volta ao Dashboard (se ainda não foi concluído)
- ProximosPassosCard aparece mesmo que o tour tenha sido interrompido
- Troca de senha não pula o fluxo de onboarding

