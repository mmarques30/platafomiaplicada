

# Integrar entregas da IA na pagina /skills/projeto/entregas

## Problema
A rota `/skills/projeto/entregas` (onde voce esta agora) usa o componente `ProjetoSkillsEntregas` que busca dados **somente** da tabela `entregas_equipe_skills` (entregas manuais da equipe). Essa tabela esta vazia, por isso nada aparece.

As 48 entregas cadastradas estao na tabela `entregas_skills` (geradas pela IA/admin), que so e consultada na rota `/skills/entregas` (componente `SkillsEntregas`).

## Solucao
Aplicar a mesma logica de unificacao que fizemos no `SkillsEntregas` dentro do `ProjetoSkillsEntregas`, para que ambas as tabelas sejam exibidas nessa pagina.

### Alteracoes em `src/components/skills/ProjetoSkillsEntregas.tsx`
- Importar e usar `useSkillsEntregas` para buscar entregas da tabela `entregas_skills`
- Combinar as duas listas (IA + manuais) em uma visualizacao unificada com badges de origem
- Adicionar modal de edicao para entregas IA (reutilizar `EntregaSkillsEditModal`)
- Manter o botao "Nova Entrega" para criacao de entregas manuais
- Manter o modal `EntregaEquipeModal` para edicao de entregas manuais

### Alteracoes em `src/pages/skills/ProjetoSkillsEntregasPage.tsx`
- Nenhuma alteracao necessaria, pois o componente filho ja recebe `equipeId`

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/components/skills/ProjetoSkillsEntregas.tsx` | Adicionar busca de `entregas_skills` via `useSkillsEntregas`; unificar listas; adicionar `EntregaSkillsEditModal` para edicao de entregas IA; badges de origem (IA/Manual) |

