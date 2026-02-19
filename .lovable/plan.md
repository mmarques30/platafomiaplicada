

# Simplificar Badges - Remover Excesso de Informacao

## Problema

Os cards e tabelas de projetos e entregas mostram informacao demais: badges de "Aprovado" (redundante com a coluna do Kanban), prioridade P1/P2/P3 (nao util no momento), e badges de "Diagnostico". O usuario quer manter apenas a indicacao de se o projeto esta **priorizado ou nao**.

## Alteracoes

### 1. `src/components/skills/backlog/BacklogCard.tsx`
- **Remover** o badge "APROVADO" (linhas 50-54)
- **Remover** o badge "PRIORIZADO" (linhas 55-59)
- **Remover** o badge de prioridade P1/P2/P3 (linhas 60-64)
- **Manter** apenas o badge de area impactada e os avatares
- **Remover** o objeto `prioridadeCores` (linhas 8-15) que nao sera mais usado

### 2. `src/components/skills/backlog/BacklogTable.tsx`
- **Remover** a coluna "Prioridade" inteira (TableHead + TableCell com badges P1/P2/P3)
- Atualizar colSpan de 5 para 4
- **Remover** o objeto `prioridadeCores` (linhas 27-34)
- A coluna "Status" ja mostra se e priorizado ou nao, entao e suficiente

### 3. `src/components/skills/backlog/ProjetoDetailModal.tsx`
- **Remover** o seletor de prioridade P1/P2/P3 (linhas 166-188) do topo do modal
- **Remover** o badge "Diagnostico" (linhas 189-193)
- Manter apenas o badge de status (Levantado, Aprovado, Priorizado, etc.) que ja indica se esta priorizado ou nao

### 4. `src/components/skills/ProjetoSkillsEntregas.tsx`
- **Remover** a coluna "Prioridade" da tabela de entregas (TableHead linha 316 + TableCell linhas 350-358)
- Atualizar colSpan correspondente
- **Remover** o objeto `prioridadeColors` (linhas 33-37)

## O que sera mantido

- Badge de **status** nos projetos (mostra se e priorizado, aprovado, em execucao, etc.)
- Badge de **area impactada** nos cards
- Coluna de **status** nas tabelas
- Avatares de responsavel/colaborador
