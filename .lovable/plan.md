
# Sub-aba "Performance" na pagina Projeto Skills

## Resumo
Transformar a pagina "Projeto Skills" (`/skills/projeto`) em uma pagina com abas (tabs), adicionando a sub-aba **Performance**. Essa aba tera um dashboard analitico completo com KPIs, cronograma de 12 semanas, graficos de ROI e Maturidade IA, e ranking de colaboradores -- tudo inicialmente com dados mockados para visualizacao. Acesso restrito a administradores e lideres.

---

## Estrutura Visual

A pagina Projeto Skills passara a ter um sistema de abas:
- **Visao Geral** (aba padrao, conteudo atual placeholder)
- **Performance** (novo dashboard analitico)

A aba Performance tera os seguintes blocos:

1. **Filtros Interativos** -- Periodo, Colaborador, Projeto, Status
2. **4 KPIs** -- Horas Economizadas, ROI Acumulado, Entregas Concluidas, Performance Media
3. **Cronograma 12 Semanas** -- 3 fases (Fundacao, Expansao, Consolidacao) com indicador de semana atual
4. **2 Graficos lado a lado** -- Impacto vs ROI (AreaChart) e Evolucao Maturidade IA (BarChart)
5. **Ranking de Colaboradores** -- Tabela com posicao, nome, entregas, horas economizadas, ROI, performance

---

## Controle de Acesso

- Apenas **administradores** (`isAdmin`) e **lideres** (`isLider` via `useSkillsMembro`) verao a aba Performance
- Colaboradores comuns verao apenas a aba "Visao Geral"
- Os hooks `useUserRole` e `useSkillsMembro` ja existentes serao reutilizados

---

## Detalhes Tecnicos

### Arquivos a Criar

**`src/components/skills/ProjetoSkillsPerformance.tsx`**
- Componente do dashboard de Performance com dados mockados
- Usa componentes existentes: `Card`, `Select`, `Table`, `Badge`, `ChartContainer`
- Segue estetica Executive-Tech (sem emojis, cores `#738925`/`#0D0D0D`/`#F5F5DC`, cards brancos limpos)
- Dados mockados diretamente no componente:
  - 7 entregas com colaboradores, projetos, horas, ROI, status, performance
  - 8 semanas de dados ROI (projetado vs executado)
  - 6 semanas de dados de maturidade
  - Ranking calculado a partir das entregas mockadas

### Arquivos a Modificar

**`src/pages/skills/ProjetoSkills.tsx`**
- Adicionar sistema de `Tabs` (Visao Geral | Performance)
- Importar hooks de acesso (`useUserRole`, `useSkillsMembro`)
- Renderizar aba Performance condicionalmente (admin ou lider)
- Usar `PageTitle` com underline gradiente verde (padrao Skills)

**`src/App.tsx`**
- Sem alteracoes necessarias (rota `/skills/projeto` ja existe)

### Dados Mockados (dentro do componente)

```text
Entregas:
- Ana Silva      | Automacao RPA        | 120h | ROI 250% | Concluido     | Perf 95
- Ana Silva      | Dashboard BI         |  80h | ROI 180% | Concluido     | Perf 92
- Carlos Santos  | Chatbot Atendimento  | 200h | ROI 320% | Concluido     | Perf 88
- Carlos Santos  | Analise Preditiva    | 150h | ROI 280% | Em andamento  | Perf 85
- Maria Costa    | OCR Documentos       | 180h | ROI 310% | Concluido     | Perf 90
- Joao Oliveira  | API Integracao       |  90h | ROI 160% | Em andamento  | Perf 78
- Beatriz Lima   | ML Classificacao     | 110h | ROI 220% | Atrasado      | Perf 65

ROI Semanal: semanas 1-8 com projetado crescente e executado acompanhando
Maturidade: semanas 1-6 com indice crescente (25 -> 78)
```

### Bibliotecas Utilizadas (ja instaladas)
- `recharts` (AreaChart, BarChart)
- `@radix-ui/react-tabs` (sistema de abas)
- `@radix-ui/react-select` (filtros)
- `lucide-react` (icones)

### Sem Alteracoes no Banco de Dados
- Nenhuma migracao necessaria neste momento
- Dados 100% mockados no frontend
- Futuramente, sera conectado ao `useSkillsLider` para dados reais
