

# Adicionar submenus faltantes ao menu_config para gestão pelo admin

## Problema
Páginas como "Métodos", "Ferramentas", "Prompts", "IA Copie e Use", "Feed", "Vídeos Bônus" etc. estão **hardcoded** no `AppSidebar.tsx` e não existem na tabela `menu_config`. Por isso, o admin não consegue ocultar/mostrar essas páginas pela tela "Gerenciar Menus".

## Solução

### 1. Inserir registros faltantes no `menu_config`
Criar migration com os submenus que faltam:

| menu_key | label | parent_key | tipo |
|---|---|---|---|
| `bibliotecas` | Bibliotecas | `aprender` | sidebar |
| `biblioteca_ferramentas` | Ferramentas | `bibliotecas` | sidebar |
| `biblioteca_prompts` | Prompts | `bibliotecas` | sidebar |
| `ia_copie_use` | IA "Copie e Use" | `bibliotecas` | sidebar |
| `metodos_aplicar` | Métodos | `bibliotecas` | sidebar |
| `comunidade_feed` | Feed | `comunidade` | sidebar |
| `comunidade_videos_bonus` | Vídeos Bônus | `comunidade` | sidebar |

Todos com `visivel = true`, `editavel = true`, `tipo = 'sidebar'`.

### 2. Atualizar `AppSidebar.tsx`
Usar `isMenuVisible()` do hook `useMenuConfig` para condicionar a renderização de cada subitem hardcoded:
- Antes de renderizar "Métodos": checar `isMenuVisible('metodos_aplicar')`
- Antes de renderizar "Ferramentas": checar `isMenuVisible('biblioteca_ferramentas')`
- Idem para Prompts, IA Copie e Use, Feed, Vídeos Bônus

Se todos os subitens de "Bibliotecas" estão ocultos, ocultar o grupo inteiro.

### 3. Atualizar `GerenciarMenus.tsx`
Esses novos registros já aparecerão automaticamente na hierarquia pai-filho existente, pois a query já busca todos os itens `tipo = 'sidebar'`.

## Arquivos alterados
- **Migration SQL**: inserir ~7 registros no `menu_config`
- **`src/components/layout/AppSidebar.tsx`**: adicionar checagens `isMenuVisible()` nos subitens hardcoded
- **`src/hooks/useMenuConfig.tsx`**: sem alteração (já tem `isMenuVisible`)

