

# Atualizar Gerenciar Menus: Incluir Páginas Admin

## Problema
A página "Gerenciar Menus e Páginas" (`/admin/menus`) só exibe menus do tipo `sidebar` e `header` (menus do site do usuário). Não mostra nenhum item relacionado às páginas admin. Além disso, existem rotas admin que nem aparecem no AdminSidebar:
- `/admin/importar-usuarios`
- `/admin/historico-senhas`
- `/admin/politicas`

## Solução

### 1. Adicionar itens faltantes ao AdminSidebar
**Arquivo: `src/components/admin/AdminSidebar.tsx`**

Adicionar no grupo "Sistema":
- `Políticas` → `/admin/politicas`
- `Histórico de Senhas` → `/admin/historico-senhas`

Adicionar no grupo "Usuários":
- `Importar Usuários` → `/admin/importar-usuarios`

### 2. Adicionar seção "Páginas Admin" ao GerenciarMenus
**Arquivo: `src/pages/admin/GerenciarMenus.tsx`**

Incluir uma terceira seção (Card) que lista todas as páginas administrativas existentes com base nos grupos do `AdminSidebar`. Esta seção será estática (informativa) mostrando todas as rotas admin organizadas por grupo, para que o administrador tenha visibilidade completa de todas as páginas do painel.

### 3. Mostrar itens `admin_sidebar` do banco
Na query existente, já retorna itens com `tipo = 'admin_sidebar'` (ex: `admin_politicas`). Adicionar um Card "Menus Admin (Configuráveis)" para exibir e gerenciar esses itens do banco, usando o mesmo `renderMenuRow` já existente.

## Resumo das alterações
- `AdminSidebar.tsx`: 3 novos itens de menu nos grupos existentes
- `GerenciarMenus.tsx`: 2 novos Cards — um para itens admin configuráveis do banco e outro com referência completa de todas as páginas admin

