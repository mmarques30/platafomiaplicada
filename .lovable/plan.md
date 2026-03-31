

# Eliminar duplicação de banners no Dashboard

## Problema

`DashboardUrgencias` e `PendenciasOnboarding` ambos verificam o diagnóstico, gerando dois avisos redundantes na tela (visível no screenshot).

## Solução

Remover a verificação de diagnóstico do `DashboardUrgencias`. Esse componente foi criado para urgências com prazo (sessões em 24h, entregas em 3 dias, tarefas críticas) — o diagnóstico não tem prazo e já é coberto pelo `PendenciasOnboarding`.

## Alteração

**Arquivo**: `src/components/dashboard/DashboardUrgencias.tsx`

- Remover o bloco que busca `formulario_diagnostico` e gera a urgência "Preencha seu diagnóstico"
- Manter apenas as 3 urgências com deadline: sessão em 24h, entrega em 3 dias, tarefas críticas
- Se nenhuma dessas urgências existir, o componente retorna `null` (como já faz)

Nenhum outro arquivo alterado.

