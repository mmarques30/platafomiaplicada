

# Atualizar Gerenciar Menus: Mostrar Submenus e Páginas Faltantes

## Problema
A página "Gerenciar Menus" mostra os itens do `menu_config` como lista plana, sem agrupar submenus sob seus pais. Além disso, várias páginas da plataforma (Métodos, Bibliotecas, IA Copie e Use, etc.) não existem na tabela `menu_config` e portanto não aparecem na gestão.

## Solução

### 1. Reorganizar exibição com hierarquia pai-filho
No card "Menus da Sidebar", agrupar visualmente os itens:
- Mostrar primeiro os menus principais (`parent_key = null`)
- Logo abaixo, indentados, os submenus (`parent_key = menu_key do pai`)
- Usar `ml-6 border-l` para indicar hierarquia visual

### 2. Adicionar referência completa de todas as páginas do usuário
Atualizar o card de referência para incluir TODAS as rotas da plataforma (não só admin), organizadas por seção:

**Páginas do Usuário (faltantes na referência):**
- Ferramentas: `/biblioteca-ferramentas`
- Prompts: `/biblioteca-prompts`
- Métodos para Aplicar: `/metodos-aplicar`
- IA Copie e Use: `/ia-copie-use`
- Materiais Gratuitos: `/materiais-gratuitos`
- Vídeos Bônus: `/videos-bonus`
- Central: `/central`
- Cupons: `/cupons`
- Instalar App: `/instalar`
- Mentoria (várias sub-rotas): `/mentoria/*`
- Meu Sistema: `/meu-sistema/*`
- Skills (várias sub-rotas)
- Comunidade: `/comunidade`

### Alterações técnicas

**Arquivo: `src/pages/admin/GerenciarMenus.tsx`**

1. Refatorar renderização dos sidebar menus para agrupar por hierarquia:
```tsx
const parentMenus = sidebarMenus.filter(m => !m.parent_key);
const getChildren = (key: string) => sidebarMenus.filter(m => m.parent_key === key);

// Render: para cada parent, mostrar o parent + children indentados
```

2. Adicionar seção "Páginas do Usuário" ao card de referência com todas as rotas faltantes organizadas por grupo (Bibliotecas, Mentoria, Skills, Sistema, etc.)

3. Separar cards: "Referência: Páginas Admin" e "Referência: Páginas do Usuário"

