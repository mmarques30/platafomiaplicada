

# Refletir mudancas de projetos nas entregas

## Problema atual

A tabela `entregas_skills` tem um campo `backlog_item_id` que vincula cada entrega a um projeto na tabela `backlog_skills`. Porem:

1. **Projetos movidos para "Nao Aprovado"**: Existem **16 entregas** vinculadas a projetos com status `nao_aprovado` que continuam aparecendo normalmente na aba de entregas, sem nenhuma sinalizacao.
2. **Responsaveis atualizados nos projetos**: Quando o responsavel de um projeto e alterado no backlog, isso nao se reflete nas entregas, porque a query atual nao faz JOIN com `backlog_skills`.

## Solucao

### 1. `src/hooks/useSkillsEntregas.ts` — Incluir dados do projeto no JOIN

Alterar a query para incluir o JOIN com `backlog_skills` via `backlog_item_id`, trazendo:
- `backlog_item_id.titulo` (titulo do projeto)
- `backlog_item_id.status` (status do projeto — aprovado, nao_aprovado, priorizado, etc.)
- `backlog_item_id.responsavel_id` (responsavel do projeto)

### 2. `src/components/skills/ProjetoSkillsEntregas.tsx` e `src/pages/skills/SkillsEntregas.tsx` — Filtrar/sinalizar entregas

- **Ocultar por padrao** entregas cujo projeto vinculado tem status `nao_aprovado` ou `descartado`
- Adicionar um toggle ou filtro "Mostrar entregas de projetos arquivados" para que o usuario possa visualiza-las quando necessario (exibidas com opacidade reduzida e badge "Projeto Nao Aprovado")
- Na coluna "Projeto", exibir o titulo do projeto vindo do JOIN (ao inves de apenas o titulo da entrega)
- Refletir o responsavel do projeto quando a entrega nao tem responsavel proprio atribuido

### 3. Adicionar filtro por Projeto

- Novo filtro Select na barra de filtros: "Projeto" — listando os projetos ativos da equipe
- Permitir filtrar entregas por projeto especifico

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/hooks/useSkillsEntregas.ts` | Alterar select para incluir `backlog_item:backlog_item_id (id, titulo, status, responsavel_id)` no JOIN; retornar dados do projeto junto com cada entrega |
| `src/components/skills/ProjetoSkillsEntregas.tsx` | Mapear `projetoStatus` no `UnifiedEntrega`; ocultar entregas de projetos nao aprovados por padrao; adicionar toggle para mostra-las; adicionar filtro por Projeto; usar responsavel do projeto como fallback |
| `src/pages/skills/SkillsEntregas.tsx` | Mesmas alteracoes: ocultar entregas de projetos nao aprovados; adicionar toggle e filtro por Projeto |

## Comportamento esperado

- Ao abrir a aba de entregas, as 16 entregas de projetos "Nao Aprovado" ficam **ocultas por padrao**
- Um toggle discreto "Incluir projetos arquivados" permite exibi-las com visual diferenciado (opacidade + badge)
- As 32 entregas restantes (aprovado + priorizado) aparecem normalmente
- O filtro por Projeto permite ver apenas entregas de um projeto especifico
- Responsaveis dos projetos sao refletidos como fallback nas entregas sem responsavel proprio

