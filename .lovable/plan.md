
# Ajustes no Painel do Lider

## 1. Trocar cards pretos (dark) por verde da marca (accent)

No arquivo `src/components/skills/performance/KPICard.tsx`, os cards usam duas variantes: `dark` (fundo #0D0D0D preto) e `accent` (fundo verde). O pedido e usar apenas a variante verde para todos.

**Alteracao em `src/components/skills/visao-geral/ResumoPerformanceCards.tsx`:**
- Trocar `variant="dark"` por `variant="accent"` nos dois cards que usam fundo preto ("Projetos Mapeados" e "Entregas")
- Resultado: os 4 cards ficarao com o mesmo visual verde limpo

## 2. Corrigir contagem de entregas (excluir projetos nao aprovados)

Atualmente o hook `useSkillsLider.ts` conta **todas** as entregas da equipe (linha 396: `totalEntregas = entregas.length`), incluindo as 16 entregas vinculadas a projetos com status `nao_aprovado`. Isso infla o numero.

**Alteracao em `src/hooks/useSkillsLider.ts`:**
- Na query de entregas (linha 144), adicionar um JOIN com `backlog_skills` para trazer o status do projeto vinculado
- Filtrar entregas cujo projeto vinculado (`backlog_item_id`) tenha status `nao_aprovado` ou `descartado`
- Alternativa mais simples: filtrar no lado do cliente apos buscar os dados, usando os projetos ja carregados

**Abordagem escolhida (cliente):**
- Apos buscar entregas e projetos, criar um Set com os IDs de projetos nao aprovados/descartados
- Filtrar `entregas` para excluir as que tenham `backlog_item_id` em projetos nao aprovados
- Atualizar `totalEntregas` e `entregasConcluidasList` para usar a lista filtrada

Isso requer buscar o campo `backlog_item_id` na query de entregas (que hoje nao e selecionado).

### Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `ResumoPerformanceCards.tsx` | Trocar `variant="dark"` para `variant="accent"` em 2 cards |
| `useSkillsLider.ts` linha 146 | Adicionar `backlog_item_id` ao select da query de entregas |
| `useSkillsLider.ts` interface Entrega | Adicionar campo `backlogItemId` |
| `useSkillsLider.ts` linhas 395-396 | Filtrar entregas excluindo as vinculadas a projetos `nao_aprovado`/`descartado` antes de calcular totais |
