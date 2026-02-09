
# Novo submenu "Projetos" no Projeto Skills com Kanban Board

## Resumo

Criar uma nova pagina `/skills/projeto/projetos` com um quadro Kanban conectado a tabela `entregas_skills`, e adicionar o submenu "Projetos" no menu lateral abaixo de "Diagnostico".

## Estrutura

```text
Projeto Skills (menu)
  ├── Visao Geral      (ordem 1)
  ├── Performance      (ordem 2)
  ├── Diagnostico      (ordem 3)
  └── Projetos         (ordem 4)  <-- NOVO
```

## Alteracoes

### 1. Banco de dados (menu_config)
Inserir novo registro na tabela `menu_config`:
- menu_key: `projeto_skills_projetos`
- label: `Projetos`
- url: `/skills/projeto/projetos`
- parent_key: `projeto_skills`
- ordem: 4
- planos_permitidos: `["skills"]`
- tipo: `sidebar`
- visivel: true

### 2. Nova pagina: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`
- Wrapper com `PageTitle` (Projeto / Skills) e `SkillsAdminGuard`
- Renderiza o componente Kanban

### 3. Novo componente Kanban: `src/components/skills/ProjetoSkillsKanban.tsx`
Quadro Kanban com 4 colunas baseadas no status das `entregas_skills`:

| Coluna | Status | Cor |
|--------|--------|-----|
| Pendente | pendente | cinza |
| Em Andamento | em_andamento | azul |
| Aguardando Validacao | aguardando_validacao | amarelo |
| Concluido/Aprovada | concluido, aprovada | verde marca |

Cada card mostra:
- Titulo da entrega
- Responsavel (avatar + nome)
- Prazo (badge com cor se atrasado)
- Progresso (barra horizontal)
- ROI / horas economizadas

Funcionalidades:
- Drag-and-drop entre colunas usando `@dnd-kit/core` e `@dnd-kit/sortable` (ja instalados)
- Ao mover um card, atualiza o status via `useSkillsEntregas` mutation
- Filtro por responsavel no topo
- Responsivo: em mobile as colunas empilham verticalmente com scroll horizontal

### 4. Rota no App.tsx
Adicionar:
```
<Route path="/skills/projeto/projetos" element={<ProjetoSkillsProjetosPage />} />
```

### 5. Menu lateral (useMenuConfig + AppSidebar)
- Adicionar `projeto_skills_projetos` na lista de menus restritos a lider/admin no `AppSidebar.tsx` (linha 123)
- Adicionar `projeto_skills_projetos` nas listas de `hiddenByEnvironment` dos ambientes que nao sao Skills (business, business_iaplicada, academy, gratuito)

### 6. Dados
Usa o hook `useSkillsEntregas` existente que ja retorna todas as entregas da equipe para lideres. Adicionar uma mutation `atualizarStatus` no hook para suportar drag-and-drop.

## Detalhes tecnicos do Kanban

**Drag and Drop** (com @dnd-kit):
```typescript
<DndContext onDragEnd={handleDragEnd}>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {columns.map(col => (
      <DroppableColumn key={col.status} column={col}>
        <SortableContext items={col.items}>
          {col.items.map(item => <DraggableCard key={item.id} entrega={item} />)}
        </SortableContext>
      </DroppableColumn>
    ))}
  </div>
</DndContext>
```

**Card visual**:
- Fundo branco com borda sutil
- Badge de status colorido no topo
- Nome do responsavel com avatar pequeno
- Barra de progresso (mesma do WeeklyBarChart)
- Prazo com indicador vermelho se vencido

**Responsividade**:
- Desktop: 4 colunas lado a lado
- Tablet: 2 colunas
- Mobile: scroll horizontal ou 1 coluna empilhada
