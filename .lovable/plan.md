
# Melhorar modal de Metodos para Aplicar

## Problema
O campo "Link do Documento" esta marcado como obrigatorio, mas um metodo pode ser apenas um prompt de personalizacao, sem link externo.

## Mudanca

### `src/components/admin/bibliotecas/MetodoModal.tsx`
1. Remover `required` da validacao do campo `link_documento` (linha 105)
2. Remover o asterisco `*` do label "Link do Documento" (linha 100)
3. Atualizar o texto auxiliar para indicar que e opcional
4. Adicionar um campo `template` (Textarea) para permitir inserir o conteudo do prompt diretamente, com placeholder explicativo — ja que a coluna `template` existe na tabela e e nullable
5. Ajustar o `onSubmit` para usar o campo `template` diretamente ao inves de forcar "Via documento externo"

## Detalhes

- A coluna `link_documento` ja e nullable no banco, entao nao precisa de migracao
- A coluna `template` ja existe e e nullable — sera usada para o conteudo do prompt
- O campo `template` tera um Textarea com label "Prompt / Template" e placeholder orientativo
- O `onSubmit` deixara de sobrescrever `template` com `data.link_documento`

## Arquivo modificado
1. `src/components/admin/bibliotecas/MetodoModal.tsx`
