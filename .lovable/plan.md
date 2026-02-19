
# Correcoes no Painel do Lider - Cores e Filtros de Projetos Ativos

## Problemas identificados

### 1. Filtro de 48 entregas persiste
O filtro adicionado no `filteredEntregas` esta correto, mas outros componentes recebem dados **nao filtrados**:
- `PortfolioOverview` recebe `projetos` (todos os 12, incluindo inativos)
- `ProjetosResumoTable` recebe `projetos` e `entregasEquipe` sem filtro
- O KPI "Total de Projetos" conta todos os projetos do backlog

Dados reais do banco:
- 48 entregas totais: 20 de projetos aprovados, 12 de priorizados, **16 de nao_aprovados**
- Projetos: 5 aprovados, 3 priorizados, **4 nao_aprovados**

### 2. Verde muito escuro nos KPIs
Os cards usam cores como `#9EB038` (ok) e `#738925` (escuro demais). Precisa um verde mais clean e claro.

## Alteracoes

### Arquivo 1: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

- Filtrar `projetos` para remover os inativos antes de passar para `PortfolioOverview` e `ProjetosResumoTable`
- Filtrar `entregasEquipe` para excluir entregas de projetos inativos na tabela de resumo

```typescript
// Novo: projetos ativos apenas
const projetosAtivos = useMemo(() => {
  const statusInativos = ["nao_aprovado", "levantado", "backlog"];
  return (projetos || []).filter(p => !statusInativos.includes(p.status));
}, [projetos]);

// Novo: entregas equipe filtradas
const entregasEquipeAtivas = useMemo(() => {
  if (!entregasEquipe || !projetosAtivos) return [];
  const idsAtivos = new Set(projetosAtivos.map(p => p.id));
  return entregasEquipe.filter(e => !e.projeto_id || idsAtivos.has(e.projeto_id));
}, [entregasEquipe, projetosAtivos]);
```

- Passar `projetosAtivos` em vez de `projetos` para `PortfolioOverview` e `ProjetosResumoTable`
- Passar `entregasEquipeAtivas` para `ProjetosResumoTable`

### Arquivo 2: `src/components/skills/kanban/PortfolioOverview.tsx`

- Substituir verde escuro `#738925` por `#B8CC5A` (verde mais claro/clean)
- Atualizar background dos icones para tons mais suaves

### Arquivo 3: `src/components/skills/kanban/PortfolioSidebar.tsx`

- Substituir `#738925` por `#B8CC5A` para consistencia visual

## Resultado esperado

| Metrica | Antes | Depois |
|---|---|---|
| Total de Projetos | 12 (todos) | 8 (apenas ativos) |
| Total de Entregas | 48 | 32 (apenas de projetos ativos) |
| Verde dos cards | #738925 (escuro) | #B8CC5A (claro/clean) |
