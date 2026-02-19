

# Remover badge "IA" das entregas

## Alteracoes

### 1. `src/components/skills/EntregaSkillsEditModal.tsx`
- Remover o badge `<Badge>IA</Badge>` do titulo do modal (linha 149)

### 2. `src/components/skills/ProjetoSkillsEntregas.tsx`
- Remover o filtro de "Origem" (IA/Manual) do select de filtros (linhas 249-257)
- Remover o state `filterOrigem` e sua logica de filtragem
- Remover referencia a `filterOrigem` em `hasActiveFilters` e `clearFilters`

### O que permanece
- A logica interna de `origem` continua existindo no codigo para diferenciar o comportamento ao abrir o modal de edicao (IA abre `EntregaSkillsEditModal`, manual abre `EntregaEquipeModal`)
- Apenas a exposicao visual do badge e filtro de origem sera removida

