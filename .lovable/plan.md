

# Transformar página de Tarefas do mentorado em gerenciador completo

## Situação atual

A página `MentoriaTarefasDetalhes.tsx` (rota `/mentoria/tarefas`) é **somente leitura** para o mentorado Business Parceria. Ela mostra tarefas em tabela/kanban mas sem possibilidade de criar, editar, alterar status ou excluir. Apenas o admin consegue gerenciar tarefas via `TarefasAdmin`.

## Solução

Adicionar funcionalidades de CRUD completo na página do mentorado, permitindo:

1. **Botão "Nova Tarefa"** no header ao lado do toggle de visualização
2. **Modal de criação/edição** reutilizando o `TarefaModal` existente (campos: título, descrição, tipo, prioridade, prazo, link externo)
3. **Ações em cada tarefa**: editar, alterar status (dropdown), enviar entrega (upload), excluir (com confirmação)
4. **Cards do Kanban clicáveis** para abrir edição
5. **Drag-like status change** — botões rápidos de "Iniciar", "Concluir" em cada card/linha

### Mudanças concretas

**Arquivo**: `src/pages/MentoriaTarefasDetalhes.tsx`

- Importar `createTarefa`, `updateTarefa`, `deleteTarefa`, `uploadEntrega` do `useMentoriaTarefas` (atualmente só importa `tarefas` e `isLoading`)
- Importar `TarefaModal` de `@/components/admin/mentoria/TarefaModal`
- Importar `AlertDialog` para confirmação de exclusão
- Adicionar `useAuth` para obter `user.id`
- Adicionar estado local para modal e tarefa em edição
- Adicionar botão "Nova Tarefa" no header
- Na tabela: adicionar coluna "Ações" com botões de editar, mudar status, e excluir
- No kanban: adicionar botão de ação em cada card (editar, mudar status)
- Adicionar upload de entrega funcional (botão "Enviar" que abre file input)

### Detalhes técnicos

- `TarefaModal` já aceita `userId` como prop e funciona tanto para criar quanto editar
- As mutations `createTarefa`, `updateTarefa`, `deleteTarefa` já existem no hook `useMentoriaTarefas`
- Upload usa `uploadEntrega` do mesmo hook com bucket `entregas-mentoria`
- O formulário simplificado para o mentorado omitirá campos de sessão/projeto (que são mais relevantes para o admin)

