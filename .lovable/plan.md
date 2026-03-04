

# Adicionar filtro por plano em Gerenciar Usuarios

Adicionar um segundo `Select` na barra de filtros, ao lado do filtro de role existente, para filtrar usuarios por `plano_mentoria`.

## Alteracoes

**Arquivo:** `src/pages/admin/GerenciarUsuarios.tsx`

1. Novo state `planoFilter` (default `"all"`)
2. Novo `Select` com opcoes: Todos, Academy, Skills, Business, Business IAplicada, Sem Plano
3. Atualizar `filteredUsers` para incluir condicao de plano:
   - `"all"` mostra todos
   - `"none"` mostra quem tem `plano_mentoria` null/undefined
   - Demais valores comparam direto com `plano_mentoria`

Nenhum outro arquivo precisa ser alterado.

