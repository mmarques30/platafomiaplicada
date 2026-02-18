
# Adicionar Colaborador aos Projetos do Backlog

## O que sera feito
Cada projeto passara a ter dois papeis: **Dono** (responsavel principal, ja existente) e **Colaborador** (novo campo). Isso permite distribuir melhor as responsabilidades dentro da equipe.

## Alteracoes

### 1. Migracao de banco de dados
- Adicionar coluna `colaborador_id UUID` na tabela `backlog_skills`, com foreign key para `profiles(id)`
- A coluna sera nullable (colaborador e opcional)

### 2. Hook `useSkillsBacklog.ts`
- Incluir `colaborador_id` no tipo `BacklogItem`
- Adicionar campo `colaborador` (nome, avatar) similar ao `responsavel`
- Buscar dados do colaborador junto com os do responsavel na query

### 3. `ProjetoDetailModal.tsx`
- Adicionar setor "Colaborador" abaixo do "Responsavel"
- Usar o mesmo Select com membros da equipe
- Salvamento automatico no onBlur (mesmo padrao do responsavel)
- Filtrar o colaborador para nao permitir selecionar a mesma pessoa que e o dono

### 4. `AddProjetoModal.tsx`
- Nenhuma alteracao necessaria - o colaborador pode ser atribuido depois, no modal de detalhes (mantendo o formulario de criacao simples)

### 5. `BacklogCard.tsx`
- Exibir segundo avatar ao lado do responsavel quando houver colaborador
- Avatares empilhados (sobrepostos) para indicar visualmente que ha duas pessoas

### 6. `BacklogTable.tsx`
- Renomear coluna "Responsavel" para "Equipe" ou manter e mostrar ambos os avatares na mesma celula

### 7. `BacklogView.tsx`
- Adicionar filtro de Colaborador no filtro de responsavel (ou unificar para filtrar por "envolvidos")

### 8. Correcao do build
- Deletar `bun.lockb` para resolver o erro do `mux-embed`

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| Migracao SQL | `ALTER TABLE backlog_skills ADD COLUMN colaborador_id UUID REFERENCES profiles(id)` |
| `src/hooks/useSkillsBacklog.ts` | Buscar dados do colaborador, atualizar tipo BacklogItem |
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Select para colaborador com salvamento automatico |
| `src/components/skills/backlog/BacklogCard.tsx` | Avatares empilhados (dono + colaborador) |
| `src/components/skills/backlog/BacklogTable.tsx` | Mostrar ambos avatares na celula |
| `src/components/skills/backlog/BacklogView.tsx` | Filtro atualizado para considerar colaborador |
| `bun.lockb` | Deletar para corrigir build |
