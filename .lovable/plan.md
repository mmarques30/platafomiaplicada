

# Reorganizar menu lateral Business em 3 grupos colapsáveis

## Resumo
Para ambientes Business Parceria e Business Sistemas, substituir a renderização flat dos menus por 3 grupos colapsáveis com section headers, mantendo "Minha Trajetória" / "Meu Projeto" fixo no topo.

## Abordagem
Em vez de alterar a tabela `menu_config` (que afetaria todos os planos), adicionar lógica condicional no `AppSidebar.tsx` que, quando `isBusiness`, renderiza os menus em grupos hardcoded. Os itens de cada grupo são definidos por `menu_key` e filtrados conforme o ambiente (parceria vs sistemas).

## Alterações

### 1. Editar: `src/components/layout/AppSidebar.tsx`

Quando `effectiveEnvironment` é `business_parceria` ou `business_sistemas`, após renderizar o menu "Início" e "Minha Trajetória"/"Meu Projeto" (que ficam fixos no topo), renderizar 3 `Collapsible` com `SidebarGroupLabel` em maiúsculas:

**Item fixo no topo (fora dos grupos):**
- "Minha Trajetória" (parceria) / "Meu Projeto" (sistemas) — já existente como `meu_progresso` / `meu_sistema`

**Grupo 1 — "MINHA JORNADA"** (ícone: `Route`)
| Item | URL | Parceria | Sistemas |
|------|-----|----------|----------|
| Etapas | /mentoria/etapas-business | ✅ | ✅ |
| Roadmap | /mentoria?tab=roadmap | ✅ | ❌ |
| Instruções | /mentoria/instrucoes-business | ✅ | ❌ |

**Grupo 2 — "ENTREGAS E TAREFAS"** (ícone: `Package`)
| Item | URL | Parceria | Sistemas |
|------|-----|----------|----------|
| Entregas | /mentoria/entregas | ✅ | ✅ |
| Tarefas | /mentoria/tarefas | ✅ | ❌ |
| Tasks | /mentoria/tasks-business | ✅ | ❌ |
| Validações | /mentoria/validacoes | ✅ | ✅ |
| Projetos | /mentoria/projetos | ✅ | ❌ |

**Grupo 3 — "COMUNICAÇÃO"** (ícone: `MessageSquare`)
| Item | URL | Parceria | Sistemas |
|------|-----|----------|----------|
| Sessões | /mentoria/sessoes | ✅ | ✅ |
| Dúvidas | /mentoria/duvidas | ✅ | ❌ |
| Documentos | /mentoria/documentos | ✅ | ✅ |
| Recursos | /mentoria/recursos | ✅ | ❌ |
| Reports | /mentoria/reports | ✅ | ✅ |

**Implementação:**
- Definir array de grupos com `groupKey`, `label`, `icon`, `items[]` (cada item com `label`, `url`, `environments[]`)
- Renderizar cada grupo como `Collapsible` com `defaultOpen={true}` e toggle no header
- Header do grupo: ícone + label em `text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-semibold`
- Items recuados com `pl-8`, estilo consistente com submenus existentes
- Lógica condicional: quando `isBusiness`, inserir os 3 grupos após o menu principal (Início + Trajetória/Projeto) e antes de Bibliotecas/Comunidade
- Grupos expandidos por padrão, com auto-expand quando rota ativa está dentro de um grupo

### 2. Nenhuma migração SQL necessária
Os itens são hardcoded no componente, sem novas entradas na `menu_config`.

## Arquivos
- **Editado**: `src/components/layout/AppSidebar.tsx`

