

# Plano: Painel do Lider - Dashboard Analitico

## Visao Geral

Criar um dashboard executivo unico e visual para o lider do Squad, focado em analise de performance, metricas de ROI, filtros interativos, ranking de colaboradores e evolucao de maturidade de IA no negocio.

---

## Layout do Dashboard

Pagina unica scrollavel com blocos visuais integrados:

```text
+----------------------------------------------------------+
|  HEADER: Painel do Lider - [Nome do Squad]               |
+----------------------------------------------------------+
|  FILTROS: [Periodo] [Colaborador] [Projeto] [Status]     |
+----------------------------------------------------------+
|  [KPI]  |  [KPI]  |  [KPI]  |  [KPI]                    |
+----------------------------------------------------------+
|  CRONOGRAMA 12 SEMANAS (barra horizontal)                |
+----------------------------------------------------------+
|  GRAFICO: Impacto vs ROI      |  GRAFICO: Maturidade IA  |
|  (AreaChart com 2 curvas)     |  (BarChart por semana)   |
+----------------------------------------------------------+
|  RANKING DE ENTREGAS POR COLABORADOR                     |
|  (Tabela com indicadores de performance e avaliacao)     |
+----------------------------------------------------------+
|  RESUMO DE IMPACTO (ROI consolidado)                     |
+----------------------------------------------------------+
```

---

## Bloco 1: Filtros Interativos

Barra de filtros no topo para segmentar os dados:

| Filtro | Opcoes | Funcao |
|--------|--------|--------|
| Periodo | Ultima semana / Ultimo mes / Ultimos 3 meses / Todo o programa | Filtra dados por intervalo de tempo |
| Colaborador | Todos / Lista de membros | Foca metricas em um membro especifico |
| Projeto | Todos / Lista de entregas | Analisa uma entrega especifica |
| Status | Todos / Concluido / Em andamento / Atrasado | Filtra por status das entregas |

Visual: Select dropdowns inline, estilo clean com fundo bege

---

## Bloco 2: KPIs Principais

4 cards de metricas consolidadas (mesmo padrao atual):

| KPI | Metrica | Calculo |
|-----|---------|---------|
| Horas Economizadas | Xh/sem | Soma de economia das entregas concluidas |
| ROI Acumulado | X% | (Valor gerado / Investimento) x 100 |
| Entregas Concluidas | X de Y | Total concluidas vs planejadas |
| Performance Media | X% | Media das avaliacoes das entregas |

---

## Bloco 3: Cronograma 12 Semanas

Barra horizontal visual mostrando:
- 3 fases: Fundacao (sem 1-4), Expansao (sem 5-8), Consolidacao (sem 9-12)
- Marcador da semana atual
- Cores: verde (concluido), primario (atual), cinza (futuro)

---

## Bloco 4: Grafico Impacto vs ROI

Grafico de area (AreaChart) com duas curvas:
- Curva 1: ROI Projetado (baseado em prazos das entregas)
- Curva 2: ROI Executado (baseado em entregas concluidas)
- Eixo X: Semanas ou meses do programa
- Eixo Y: Percentual de ROI

Similar ao BusinessROIChart.tsx existente, adaptado para Squad.

---

## Bloco 5: Grafico Evolucao de Maturidade IA

Grafico de barras (BarChart) mostrando evolucao semanal:
- Eixo X: Semanas do programa
- Eixo Y: Indice de maturidade (0-100)
- Metricas que compoem o indice:
  - Processos automatizados (quantidade)
  - Horas economizadas acumuladas
  - Engajamento nas trilhas
  - Entregas concluidas

Calculo do indice de maturidade:
```
maturidade = (processos_auto * 20) + (horas_econ / meta_horas * 30) + 
             (engajamento * 25) + (entregas / total_entregas * 25)
```

---

## Bloco 6: Ranking de Entregas por Colaborador

Tabela analitica com ranking e indicadores de performance:

| Coluna | Descricao |
|--------|-----------|
| Posicao | Ranking baseado em pontuacao |
| Colaborador | Nome + avatar |
| Entregas Concluidas | X de Y total |
| Horas Economizadas | Total individual |
| Performance | Nota media (0-5 estrelas ou percentual) |
| Prazo | % entregas no prazo vs atrasadas |
| Score | Pontuacao calculada |

Logica de Score:
```
score = (entregas_concluidas * 30) + (horas_economizadas * 25) + 
        (performance_media * 25) + (taxa_prazo * 20)
```

Ordenacao: Por score decrescente (melhor performance primeiro)

Cores visuais:
- Top 3: destaque verde
- Abaixo da media: destaque amarelo

---

## Bloco 7: Resumo de Impacto (ROI)

Card consolidado com metricas financeiras:

| Metrica | Calculo |
|---------|---------|
| Horas economizadas/semana | Soma das economias de entregas concluidas |
| Processos automatizados | Contagem de entregas em producao |
| Total economizado | horas_semana x semanas_desde_conclusao |
| Valor gerado | total_economizado x custo_hora (R$60) |
| Investimento | Valor do programa |
| ROI | (valor_gerado / investimento) x 100 |

Destaque visual para ROI positivo/negativo.

---

## Estrutura Tecnica

### Novas Tabelas Necessarias

**squads** (nova tabela para o ambiente Academy Squad)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Chave primaria |
| nome | TEXT | Nome do squad |
| lider_id | UUID | Referencia ao profile do lider |
| empresa_nome | TEXT | Nome da empresa |
| setor | TEXT | Setor de atuacao |
| data_inicio | DATE | Inicio do programa |
| data_fim | DATE | Fim do programa |
| investimento | NUMERIC | Valor investido (default 0) |
| custo_hora_padrao | NUMERIC | Custo/hora para ROI (default 60) |
| status | TEXT | ativo/inativo |

**membros_squad**

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Chave primaria |
| squad_id | UUID | Referencia ao squad |
| user_id | UUID | Referencia ao profile |
| cargo | TEXT | Cargo do membro |
| papel | TEXT | lider ou membro |
| status | TEXT | ativo/inativo |

**entregas_squad**

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Chave primaria |
| squad_id | UUID | Referencia ao squad |
| responsavel_id | UUID | Profile responsavel |
| titulo | TEXT | Nome da entrega |
| descricao | TEXT | Descricao |
| status | TEXT | pendente/em_andamento/concluido/atrasado |
| progresso | INTEGER | 0-100 |
| prazo | DATE | Data limite |
| economia_horas_semana | NUMERIC | Horas economizadas por semana |
| avaliacao_nota | NUMERIC | Nota de 0-5 |
| avaliacao_comentario | TEXT | Feedback da avaliacao |
| concluido_em | TIMESTAMPTZ | Data de conclusao |

**metricas_squad** (para evolucao de maturidade)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Chave primaria |
| squad_id | UUID | Referencia ao squad |
| semana | INTEGER | Numero da semana (1-12) |
| horas_economizadas | NUMERIC | Horas na semana |
| processos_automatizados | INTEGER | Quantidade de processos |
| entregas_concluidas | INTEGER | Entregas na semana |
| engajamento_trilhas | NUMERIC | % de engajamento |
| indice_maturidade | NUMERIC | Indice calculado (0-100) |

**roadmap_squad**

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Chave primaria |
| squad_id | UUID | Referencia ao squad |
| numero_fase | INTEGER | 1, 2 ou 3 |
| nome_fase | TEXT | Fundacao/Expansao/Consolidacao |
| semana_inicio | INTEGER | Semana de inicio |
| semana_fim | INTEGER | Semana de fim |
| status | TEXT | pendente/em_andamento/concluido |

---

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| src/pages/squad/SquadLiderPainel.tsx | Pagina principal do dashboard |
| src/hooks/useSquadMembro.ts | Identificar squad e papel do usuario |
| src/hooks/useSquadLider.ts | Buscar dados, calcular metricas e ranking |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| src/App.tsx | Adicionar rota /squad/lider |
| src/components/layout/AppSidebar.tsx | Transformar Squad em menu expansivel |

---

## Componentes Visuais

Todos renderizados diretamente na pagina:

### Filtros
- 4 Select dropdowns em linha
- Estilo: bg-bege, rounded-full, gap-4

### Graficos
- AreaChart para Impacto vs ROI (2 curvas)
- BarChart para Evolucao de Maturidade IA
- Usando recharts (ja instalado)
- ChartContainer do sistema

### Tabela de Ranking
- Table do shadcn/ui
- Header escuro (#0D0D0D)
- Linhas zebradas
- Badges de posicao coloridos

---

## Politicas RLS

```sql
-- Lider ve seu squad
CREATE POLICY "Lider ve seu squad" ON squads
  FOR SELECT USING (lider_id = auth.uid());

-- Membros do squad (lider ve todos, membro ve a si)
CREATE POLICY "Membros do squad" ON membros_squad
  FOR SELECT USING (
    squad_id IN (SELECT id FROM squads WHERE lider_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Entregas do squad
CREATE POLICY "Entregas do squad" ON entregas_squad
  FOR SELECT USING (
    squad_id IN (SELECT id FROM squads WHERE lider_id = auth.uid())
    OR responsavel_id = auth.uid()
  );

-- Metricas do squad
CREATE POLICY "Metricas do squad" ON metricas_squad
  FOR SELECT USING (
    squad_id IN (SELECT id FROM squads WHERE lider_id = auth.uid())
  );

-- Roadmap do squad
CREATE POLICY "Roadmap do squad" ON roadmap_squad
  FOR SELECT USING (
    squad_id IN (SELECT id FROM squads WHERE lider_id = auth.uid())
  );
```

---

## Padroes Visuais

- Sem emojis na interface
- Cores: #738925 (verde primario), #0D0D0D (preto), #F5F5DC (bege)
- Cards brancos com border-gray-200
- PageTitle com underline gradiente verde
- Graficos com gradientes suaves
- Layout responsivo: 2 colunas em desktop, 1 em mobile

---

## Estados da Pagina

| Estado | Comportamento |
|--------|---------------|
| Carregando | Skeletons em todos os blocos |
| Sem squad | Mensagem orientando contato com suporte |
| Usuario nao e lider | Redireciona para /squad |
| Sem dados | Mensagens de "Nenhum dado disponivel" em cada secao |
| Filtros aplicados | Dados filtrados em tempo real |

---

## Fluxo de Dados

1. Usuario acessa /squad/lider
2. Hook useSquadMembro verifica se e lider
3. Se nao for lider, redireciona para /squad
4. Hook useSquadLider busca:
   - Dados do squad
   - Membros e suas entregas
   - Metricas semanais
   - Roadmap
5. Calculos de ROI e ranking sao feitos no frontend
6. Filtros alteram estado local e refiltram dados
7. Graficos e tabela atualizam automaticamente

