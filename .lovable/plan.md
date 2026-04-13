

# Corrigir tela de boas-vindas travada para novos usuários

## Diagnóstico

O problema é o mesmo padrão que já corrigimos no ProximosPassosCard: **dois modais aparecem simultaneamente e o focus trap do Radix Dialog bloqueia os cliques**.

Para novos usuários Academy (criados pelo webhook), o profile tem `primeiro_acesso: true` E `senha_temporaria: true`. Isso faz com que:

1. **OnboardingVideo** apareça (z-index 9999) — visível na tela
2. **TrocarSenhaModal** apareça (Radix Dialog com `modal={true}`) — invisível por baixo, mas com **focus trap ativo**

O focus trap do Radix captura todos os cliques, tornando os botões "Entrar na plataforma" e "Pular" do OnboardingVideo completamente inertes. O usuário fica preso.

## Correção

**Arquivo**: `src/components/onboarding/OnboardingVideo.tsx`

Adicionar a mesma verificação que já existe no ProximosPassosCard: não mostrar o vídeo se `senha_temporaria === true`.

```typescript
// Linha 18-23, alterar o useEffect:
useEffect(() => {
  if (!previewMode && profile?.primeiro_acesso === true && profile?.senha_temporaria !== true) {
    const jaVisto = sessionStorage.getItem('onboarding_video_visto') === 'true';
    if (!jaVisto) setVisible(true);
  }
}, [profile, previewMode]);
```

## Sequência correta após a correção

1. Login → MainLayout carrega
2. TrocarSenhaModal aparece sozinho → troca a senha (`senha_temporaria` = false)
3. OnboardingVideo aparece sozinho → clica "Entrar" → dismiss
4. ProximosPassosCard aparece → fecha normalmente
5. Usuário acessa o sistema

