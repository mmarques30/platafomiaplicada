

# Refatorar AppSidebar — extrair 3 subcomponentes

## Análise

O arquivo tem 677 linhas com 3 blocos claramente isoláveis:

1. **Comunidade** (linhas 498–575): menu expansível condicional `!isBusiness`
2. **Admin** (linhas 583–637): painel admin + botão "Sair da Simulação"
3. **Business Groups**: NÃO existe no código atual — os grupos hardcoded mencionados no pedido (Minha Jornada, Entregas e Tarefas, Comunicação) não estão presentes no AppSidebar. Os menus Business são filtrados dinamicamente via `getSidebarMenus` + `hiddenByEnvironment` no hook `useMenuConfig`. Não há bloco a extrair para `SidebarBusinessGroups`.

## Plano (2 componentes extraíveis)

### 1. `src/components/layout/SidebarComunidadeItem.tsx`
- Extrair linhas 498–575 (Collapsible de Comunidade com Feed e Sala de Aula)
- Props: `collapsed`, `expandedMenus`, `toggleMenu`, `isMenuVisible`, `pathname`
- Renderiza `null` quando recebe `isBusiness={true}`

### 2. `src/components/layout/SidebarAdminSection.tsx`
- Extrair linhas 583–637 (grupo Administração + grupo Sair da Simulação)
- Props: `isAdmin`, `isViewingAs`, `resetView`, `collapsed`

### 3. `SidebarBusinessGroups` — não aplicável
Os menus Business não são um bloco hardcoded no sidebar — são renderizados pelo mesmo loop dinâmico (`mainMenus.map`). Criar este componente exigiria reestruturar a lógica de renderização, o que contradiz o requisito de não alterar comportamento.

### 4. AppSidebar.tsx
- Substituir os blocos extraídos por `<SidebarComunidadeItem ... />` e `<SidebarAdminSection ... />`
- Reduz ~100 linhas do arquivo principal
- Toda lógica de estado, hooks e `effectiveEnvironment` permanece no AppSidebar

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/SidebarComunidadeItem.tsx` | Novo |
| `src/components/layout/SidebarAdminSection.tsx` | Novo |
| `src/components/layout/AppSidebar.tsx` | Editado — importa e usa os 2 subcomponentes |

