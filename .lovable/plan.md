

## Redesign da Aba Acompanhamento - Estilo Dashboard Moderno

### Problema Atual
- KPIs sem icones e sem indicadores de tendencia, visual plano e sem destaque
- Grafico de barras quadrado sem gradientes ou curvas suaves
- Sidebar com informacoes basicas sem visualizacao grafica atrativa
- Cores apagadas, sem uso adequado da paleta verde da marca

### Solucao Proposta

Redesenhar os 3 componentes da aba Acompanhamento seguindo o estilo do dashboard de referencia, mantendo todas as informacoes existentes e os filtros intactos.

---

### 1. KPIs com Icones e Tendencias (`PortfolioOverview.tsx`)

**De:** Cards simples com apenas label + numero
**Para:** Cards com icone verde, valor destacado, subtitulo descritivo e indicador de tendencia

Cada KPI tera:
- Icone Lucide com fundo verde suave (`bg-[#9EB038]/10`)
- Valor grande em negrito
- Subtitulo contextual
- Seta de tendencia verde quando aplicavel

KPIs mantidos:
- Total de Projetos (icone: FolderKanban)
- Em Producao (icone: CheckCircle2)
- Em Andamento (icone: Clock)
- Economia Total (icone: TrendingUp)

---

### 2. Grafico de Area com Gradiente (`EntregasProjetadasVsExecutadasChart.tsx`)

**De:** BarChart quadrado com cores neutras
**Para:** AreaChart com curvas monotone, gradientes de preenchimento e bordas arredondadas no card

Mudancas tecnicas:
- Trocar `BarChart` + `Bar` por `AreaChart` + `Area` (ja usado em outros componentes do projeto)
- Adicionar `linearGradient` com verde da marca para a serie "executadas" e cinza suave para "projetadas"
- `type="monotone"` para curvas suaves
- Remover `CartesianGrid` pesado, usar linhas mais discretas
- Card com `rounded-2xl` ao inves de cantos retos
- Legenda customizada com bolinhas coloridas (mesmo padrao de `GraficoCalendarioSection.tsx`)
- Aumentar altura do grafico de 250px para 280px

---

### 3. Sidebar com Progresso Visual (`PortfolioSidebar.tsx`)

**De:** Barra de progresso linear simples + lista de texto
**Para:** Design mais rico com:

- Card de Progresso Geral: manter a barra `Progress` mas adicionar um indicador circular/numerico com cor verde destaque e texto maior
- Card de Distribuicao por Tipo: adicionar mini barras de progresso coloridas (verde em diferentes tons) ao lado de cada tipo, em vez de apenas numeros
- Bordas `rounded-2xl` nos cards
- Adicionar icones de cor aos tipos (bolinha colorida antes do label)

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/components/skills/kanban/PortfolioOverview.tsx` | Redesign com icones, tendencias e destaque verde |
| `src/components/skills/charts/EntregasProjetadasVsExecutadasChart.tsx` | BarChart para AreaChart com gradientes |
| `src/components/skills/kanban/PortfolioSidebar.tsx` | Progresso visual aprimorado com barras coloridas |

### Detalhes Tecnicos

- Usar `AreaChart`, `Area` do recharts (ja instalado e usado em `GraficoCalendarioSection.tsx`)
- Gradientes: `linearGradient` com `#9EB038` (verde marca) e `hsl(var(--muted-foreground))` (neutro)
- Icones: `FolderKanban`, `CheckCircle2`, `Clock`, `TrendingUp` do lucide-react
- Cards com `rounded-2xl` e sombra sutil para profundidade
- Todos os componentes usam as variaveis CSS do tema existente (sem cores hardcoded fora da paleta da marca)
- Filtros (`ProjetosFilterBar`) e layout da pagina (`ProjetoSkillsProjetosPage.tsx`) permanecem inalterados

