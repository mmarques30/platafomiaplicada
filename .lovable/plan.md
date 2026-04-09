

# Liberar Bibliotecas completas para Business Sistemas

## Problema

No `AppSidebar.tsx`, os submenus "IA Copie e Use" (linha 483) e "Arsenal IA" (linha 501) têm a condição `!isBusinessSistemasEnv`, que os oculta para usuários do Business Sistemas. Apenas Prompts e Ferramentas aparecem.

## Solução

**Arquivo**: `src/components/layout/AppSidebar.tsx`

Remover a condição `!isBusinessSistemasEnv &&` das linhas 483 e 501, liberando os 4 submenus de Bibliotecas para o Business Sistemas (mesmo comportamento do Business Parceria):

- Prompts (já visível)
- Ferramentas (já visível)
- IA "Copie e Use" (bloqueado → liberar)
- Arsenal IA (bloqueado → liberar)

Também remover `'ia_copie_use'` e `'metodos_aplicar'` do filtro `BIBLIOTECAS_KEYS` na linha 152 que exclui esses itens dos menus dinâmicos, caso esse filtro também esteja afetando a visibilidade — mas na verdade esse filtro é para evitar duplicação com o menu estático. Portanto, o ajuste principal são apenas as 2 linhas (483 e 501).

