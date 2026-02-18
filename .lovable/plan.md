

# Integrar entregas cadastradas na aba de Entregas com edicao

## Problema identificado

Existem **duas tabelas** de entregas que nao estao conectadas na interface do usuario:

1. **`entregas_skills`** (48 registros) — entregas geradas pela IA/admin, exibidas na pagina `/skills/entregas`
2. **`entregas_equipe_skills`** (0 registros atualmente) — entregas criadas manualmente pela equipe em `/skills/projeto/entregas`

A pagina `/skills/entregas` (componente `SkillsEntregas`) so le da tabela `entregas_skills` e exibe cards **somente leitura** — sem opcao de editar titulo, descricao, status, prazo, ou qualquer campo. As entregas ficam cadastradas no banco mas nao sao editaveis pela equipe.

## Solucao

Transformar a pagina `/skills/entregas` (`SkillsEntregas.tsx`) para:

1. **Exibir entregas de ambas as tabelas** — `entregas_skills` (geradas pela IA) e `entregas_equipe_skills` (criadas manualmente)
2. **Tornar os cards editaveis** — ao clicar em uma entrega, abrir um modal de edicao que permite alterar status, descricao, notas, prazo, progresso e responsavel
3. **Permitir criacao de novas entregas** pela equipe diretamente nesta aba

## Alteracoes

### 1. `src/pages/skills/SkillsEntregas.tsx`
- Manter a busca de `entregas_skills` via `useSkillsEntregas` (entregas da IA)
- Adicionar busca de `entregas_equipe_skills` via `useEntregasEquipe` (entregas manuais)
- Combinar as duas listas em uma unica visualizacao, com badge indicando a origem (IA vs Manual)
- Adicionar botao "Nova Entrega" para criar entregas manuais
- Ao clicar em qualquer card, abrir modal de edicao:
  - Para entregas de `entregas_skills`: permitir editar status (pendente, em_andamento, aguardando_validacao, aprovada)
  - Para entregas de `entregas_equipe_skills`: edicao completa (titulo, descricao, status, prazo, responsavel, progresso, notas, arquivos)
- Reutilizar o componente `EntregaEquipeModal` ja existente para as entregas manuais

### 2. `src/hooks/useSkillsEntregas.ts`
- Adicionar mutation para atualizar campos editaveis das entregas_skills (status, descricao)

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/pages/skills/SkillsEntregas.tsx` | Integrar ambas as tabelas; adicionar clique para editar; botao Nova Entrega; reutilizar EntregaEquipeModal |
| `src/hooks/useSkillsEntregas.ts` | Adicionar mutation `atualizarEntrega` para update parcial em entregas_skills |

