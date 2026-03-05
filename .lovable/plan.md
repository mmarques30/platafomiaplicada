

# Corrigir atualização do título do projeto

## Problema
O hook `useContratosBusiness` usa `staleTime: 5 minutos`. Quando você atualiza o `nome_empresa` no admin e volta a simular o acesso, o React Query serve dados do cache antigo e não refaz a busca.

## Solução
Reduzir o `staleTime` do query `contrato-business` de 5 minutos para 0, para que sempre refaça a busca ao revisitar a página. Isso garante que qualquer alteração feita no admin seja imediatamente refletida.

### Arquivo alterado
- `src/hooks/useContratosBusiness.tsx` — linha ~94: alterar `staleTime: 1000 * 60 * 5` para `staleTime: 0`

1 linha, 1 arquivo.

