

# Layout grid de 3 linhas na Visão Geral Business Parceria

## Resumo

Substituir o stack vertical (`InsightSemanalCard → BusinessROIChart → BusinessReportsCard`) por um grid de 3 linhas com KPIs no topo, usando dados dos hooks já disponíveis no projeto.

## Alterações

### 1. Criar componente `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx`

Componente que encapsula o layout de 3 linhas:

- **Linha 1 — 3 KPI cards** (`grid grid-cols-3 gap-4`):
  - **Próxima Sessão**: usa `useMentoriaSessoes(businessUserId)` para buscar próxima sessão agendada futura. Exibe dia formatado + hora.
  - **Tarefas Críticas**: usa `useTasksByUser(businessUserId)` para contar tarefas com `prioridade === 'urgente' || 'alta'` e `status !== 'aprovado'`.
  - **Progresso Geral**: usa `useEtapasBusiness(contrato?.id)` para calcular % de etapas concluídas.

- **Linha 2 — ROI + Reports** (`grid grid-cols-3 gap-4`):
  - `BusinessROIChart` ocupa `col-span-2`
  - `BusinessReportsCard` ocupa `col-span-1`

- **Linha 3 — Progresso por fase** (largura total):
  - `InsightSemanalCard` (ou `BusinessProgressoConteudo` se preferido — manter `InsightSemanalCard` como estava)

### 2. Editar `src/pages/Mentoria.tsx`

- Substituir o bloco `isBusiness` na aba Visão Geral:
  - De: `<InsightSemanalCard /> <BusinessROIChart /> <BusinessReportsCard />`
  - Para: `<BusinessVisaoGeralGrid />`
- Adicionar import do novo componente

### Hooks utilizados (já existentes no projeto)

| Hook | Dado extraído |
|---|---|
| `useMentoriaSessoes(userId)` | Próxima sessão agendada (data, hora) |
| `useTasksByUser(userId)` | Contagem de tarefas críticas |
| `useEtapasBusiness(contratoId)` | % etapas concluídas |
| `useBusinessUserId()` | User ID correto (admin ou próprio) |
| `useContratosBusiness(userId)` | Contrato para obter etapas |

### Estilo dos KPI cards

Cada KPI card será um `Card` com:
- Label superior: `text-[11px] uppercase tracking-wider text-muted-foreground`
- Valor central: `text-2xl font-bold`
- Subtítulo: `text-xs text-muted-foreground`

### Nenhuma alteração em componentes filhos, abas Roadmap/Evolução, auth ou roles.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx` | Criado |
| `src/pages/Mentoria.tsx` | Editado — substitui bloco Business na aba Visão Geral |

