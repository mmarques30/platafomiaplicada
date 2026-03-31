

# Consolidar barras de progresso — remover componente morto

## Descoberta

O `src/components/mentoria/ProgressBar.tsx` **não é importado por nenhum arquivo** do projeto. É código morto.

Além disso, ele não é realmente uma "barra de progresso" — é um **stepper** (círculos numerados com etapas). Suas props (`currentStep`, `totalSteps`, `steps`) são completamente incompatíveis com o `ui/ProgressBar.tsx` (`value`, `color`, `height`, `label`). Não há migração de imports necessária.

## Alteração

1. **Deletar** `src/components/mentoria/ProgressBar.tsx` — arquivo não utilizado.

Nenhum outro arquivo precisa ser alterado.

## Arquivos

- **Deletado**: `src/components/mentoria/ProgressBar.tsx`

