

# Adicionar campo `nome_empresa` ao modal "Editar Usuário"

## Problema
O campo `nome_empresa` está na tabela `contratos_business`, não em `profiles`. O modal "Editar Usuário" em Gerenciar Usuários só atualiza `profiles`. O campo foi adicionado ao `ContratoBusinessManager` (outra tela), mas o usuário precisa editá-lo diretamente no modal de edição de usuário.

## Solução
Adicionar o campo "Nome da Empresa (exibição)" ao modal `EditUserModal` na aba "Informações", e ao salvar, atualizar também a tabela `contratos_business` para o `user_id` correspondente.

### Alterações

1. **`src/components/admin/EditUserModal.tsx`**:
   - Adicionar estado `nomeEmpresa` e carregá-lo via query ao `contratos_business` pelo `user_id`
   - Adicionar input "Nome da Empresa (exibição no projeto)" na aba Informações (visível apenas para planos Business)
   - No `onSubmit`, fazer upsert/update em `contratos_business` com o `nome_empresa`

2. **`src/components/admin/EditUserModal.tsx`** (fetch):
   - Buscar o contrato do usuário (`contratos_business` where `user_id = user.id`) para preencher o campo ao abrir o modal

Isso permite que ao editar o JIMOBI em Gerenciar Usuários, você defina o nome que aparece no título "Projeto [Nome]".

