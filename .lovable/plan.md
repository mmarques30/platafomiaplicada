

# Personalizar mensagens de notificação no Monitor de Onboarding

## Resumo
Substituir a mensagem genérica do botão "Notificar" por mensagens contextuais baseadas na etapa onde o usuário parou no onboarding.

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/pages/admin/OnboardingMonitor.tsx` | Editar |

## Detalhes

1. Adicionar função `getMensagemNotificacao(etapaAtual, nome, plano)` com mensagens específicas para cada etapa (não iniciou, vídeo, tour, próximos passos por plano, fallback)
2. No `handleNotificar`, passar `row.etapaAtual` e `row.profile.plano_mentoria` — substituir a mensagem fixa pelo retorno da função
3. Nenhuma outra alteração no componente

