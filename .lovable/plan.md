

## Redesenhar "Resumo do Projeto" com gráficos + cards

### O problema
Hoje os 3 cards (Evolução, Atividade, Painel) só mostram texto e barras de progresso simples. As métricas não se destacam visualmente e o usuário não consegue "ler" a saúde do projeto em 1 segundo.

### Nova estrutura (2 linhas)

**Linha 1 — Hero metrics (4 cards compactos KPI)**
Substitui a leitura puramente textual por números grandes + ícone + delta visual.

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Progresso    │ Saúde        │ Prazo        │ Documentação │
│ 0%           │ Atenção      │ 350d         │ 4 itens      │
│ 0/7 entregas │ -4% vs plano │ até DD/MM/AA │ 3 arq · 1 lnk│
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Linha 2 — Visualizações (3 colunas)**

- **Coluna A (col-span-2): "Progresso vs Cronograma"** — gráfico `RadialBarChart` (recharts) com 2 anéis concêntricos:
  - anel externo = % entregas concluídas (cor primary)
  - anel interno = % cronograma decorrido (cor chart-4)
  - número grande no centro com o % de entregas
  - Legenda lateral com os 2 valores e o "delta" (saúde do projeto)
  - Abaixo: mini barra horizontal mostrando timeline (início → hoje → fim) com marcador da posição atual

- **Coluna B (col-span-1): "Composição da Documentação"** — `PieChart` (donut) com fatias para Arquivos / Anotações / Links / Reports, cada uma com cores chart-1..chart-4. Legenda com contagens.

**Linha 3 — Atividade + Painel (2 colunas)**

- **Atividade Recente (col-span-2)** — timeline vertical estilizada (já existe, mantém 4 itens com `dd/MM HH:mm`), mas com:
  - linha vertical conectando os ícones (visual de timeline real)
  - badge de tipo colorido por categoria (arquivo=azul, nota=âmbar, link=verde, report=roxo)
  - empty state mantido

- **Painel do Projeto (col-span-1)** — mantém a lista atual de insights (já está bom), mas:
  - cabeçalho ganha um mini "score" agregado (ex.: "3 OK · 2 alertas")
  - linhas com fundo sutil colorido por tipo (success/warning/info) ao invés de só ícone

### Detalhes técnicos

- **Biblioteca:** `recharts` (já instalada e usada em `VideoAnalyticsCharts.tsx`).
- **Cores:** usar tokens HSL existentes (`hsl(var(--primary))`, `hsl(var(--chart-1..4))`, `hsl(var(--muted))`).
- **Responsivo:** em mobile (`< md`), tudo vira coluna única; em `md` o grid muda para 2 colunas; em `lg` aplica o grid de 4/3/3 descrito acima.
- **Componente reutilizável:** criar `src/components/business/ProjetoResumoDashboard.tsx` recebendo props `{ contrato, progresso, cronograma, atividadeRecente, insights, documentos, notas, links, reports }` para evitar duplicar 200 linhas em ambas as páginas.
- **Datas:** `format(new Date(...), "dd/MM/yyyy")` via `date-fns/ptBR` (já importado).
- **Sem mudanças em:** hooks, banco, edge functions, rotas.

### Arquivos editados

1. **Criar** `src/components/business/ProjetoResumoDashboard.tsx` — todo o novo bloco (KPIs + radial + donut + timeline + painel).
2. **Editar** `src/pages/MentoriaDocumentos.tsx` — substituir as ~100 linhas do bloco "Resumo do Projeto" por `<ProjetoResumoDashboard {...props} />`.
3. **Editar** `src/pages/MeuSistemaDocumentos.tsx` — mesma substituição idêntica.

### Resultado esperado

- Visão executiva: 4 KPIs no topo dão leitura imediata (progresso, saúde, prazo, docs).
- Gráficos radiais e donut tornam a comparação progresso×cronograma e a composição da documentação intuitivas.
- Timeline visual da atividade recente substitui a lista plana.
- Painel de insights ganha hierarquia visual com fundos sutis.
- Zero duplicação de código entre as duas páginas (componente único compartilhado).

