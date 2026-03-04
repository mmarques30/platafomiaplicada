

# Corrigir exibicao da role "Equipe" em Gerenciar Usuarios

## Problema
A role `equipe` existe no banco e pode ser atribuida via `UserRoleModal` e `NovoUsuarioModal`, mas a pagina Gerenciar Usuarios nao tem:
- Label para "equipe" em `getRoleLabel` (exibe o valor bruto)
- Badge variant para "equipe" em `getRoleBadgeVariant`
- Opcao "Equipe" no filtro de roles

## Alteracoes

**Arquivo:** `src/pages/admin/GerenciarUsuarios.tsx`

1. Adicionar `case "equipe": return "Equipe"` em `getRoleLabel`
2. Adicionar `case "equipe": return "secondary"` (ou outro variant) em `getRoleBadgeVariant`
3. Adicionar `<SelectItem value="equipe">Equipe</SelectItem>` no filtro de roles

**Arquivo:** `src/pages/admin/CadastrarUsuario.tsx`

4. Adicionar "equipe" ao type `AppRole` e checkbox correspondente no formulario (consistencia com `NovoUsuarioModal`)

