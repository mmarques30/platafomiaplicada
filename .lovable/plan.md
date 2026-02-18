

# Converter entregas de cards para tabela com filtros completos

## Problema atual
As entregas estao exibidas em formato de cards (grid), o que dificulta a leitura e comparacao rapida. Alem disso, os filtros sao limitados (apenas status ou origem) e nao permitem filtrar por projeto, responsavel ou prazo.

## Solucao

### 1. `src/components/skills/ProjetoSkillsEntregas.tsx` — Reformular para tabela com filtros

**Barra de filtros inline** (seguindo o padrao discreto ja usado em `ProjetosFilterBar`):
- Filtro por Status (Select)
- Filtro por Responsavel (Select, populado com membros da equipe)
- Filtro por Origem (Todas / IA / Manual)
- Filtro por Prioridade (P1/P2/P3)
- Botao "Limpar" quando houver filtros ativos

**Tabela com colunas**:
| Titulo | Projeto | Status | Prioridade | Responsavel | Prazo | Progresso | Origem |
|---|---|---|---|---|---|---|---|

- Linhas clicaveis para abrir o modal de edicao (mesma logica atual)
- Badges coloridos para status, prioridade e origem
- Barra de progresso compacta na coluna Progresso
- Manter botao "Nova Entrega" no topo

### 2. `src/pages/skills/SkillsEntregas.tsx` — Mesma reformulacao

**Barra de filtros inline** (mesmos filtros acima):
- Filtro por Status
- Filtro por Responsavel
- Filtro por Origem
- Botao "Limpar"

**Tabela** substituindo o grid de cards, com as mesmas colunas e logica de clique.
Manter os cards de KPI (Total, Pendentes, Aguardando, Concluidas) no topo.

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `src/components/skills/ProjetoSkillsEntregas.tsx` | Substituir grid de cards por Table; adicionar filtros por status, responsavel, origem e prioridade; manter modais e logica de edicao |
| `src/pages/skills/SkillsEntregas.tsx` | Substituir grid de cards por Table; adicionar filtros por status, responsavel e origem; manter KPIs no topo e modais de edicao |

