

# Corrigir Painel Lider: Dashboards desatualizados e dados incompletos

## Problemas Identificados

### 1. Tabela `entregas_skills` esta vazia
As entregas antigas foram deletadas (durante a correcao de entregas = copias de projetos) e ainda nao foram regeneradas. Sem dados nessa tabela, TODOS os dashboards ficam zerados.

### 2. Projetos atribuidos apenas ao Erich
Na tabela `backlog_skills`, 8 dos 10 projetos estao atribuidos ao Erich (user_id `8cc7e7fa`). Lucio, Livia e Antonio nao tem nenhum projeto atribuido. Isso explica por que eles aparecem com "Sem entregas".

### 3. Dashboard nao usa dados de `backlog_skills`
O hook `useSkillsLider` busca dados APENAS de `entregas_skills` para alimentar KPIs, ranking, donut charts, pie chart e barras de maturidade. Ele nao busca dados de `backlog_skills` (projetos), entao mesmo com projetos ja gerados e atribuidos, o dashboard nao reflete isso.

### 4. MemberDonutCharts mostra apenas 3 entregas com titulo truncado
Nao mostra a quantidade total de entregas/projetos por membro, apenas lista ate 3 titulos.

## Solucao

### 1. Incluir dados de `backlog_skills` no hook `useSkillsLider`

Adicionar query para buscar projetos do backlog e incluir nos calculos:
- Ranking: considerar projetos atribuidos quando nao ha entregas
- KPIs: mostrar total de projetos alem de entregas
- Donut Charts: mostrar projetos atribuidos ao membro quando nao ha entregas

### 2. Atualizar MemberDonutCharts

- Quando ha entregas: manter comportamento atual mas melhorar exibicao (mostrar contagem e descricao resumida)
- Quando NAO ha entregas mas ha projetos atribuidos: mostrar os projetos do backlog com badge de status
- Exibir contagem total (ex: "3 projetos | 0 entregas concluidas")

### 3. Atualizar StatusPieChart

- Quando entregas esta vazio, usar dados de backlog_skills para mostrar distribuicao por status dos projetos (levantado, em_andamento, etc.)

### 4. Atualizar WeeklyBarChart (Evolucao de Maturidade)

- Quando entregas esta vazio, usar projetos do backlog para calcular progresso por membro
- Mostrar "projetos atribuidos" como metrica de base

### 5. Atualizar KPI Cards

- Mostrar projetos mapeados como KPI quando entregas nao existem
- Exemplo: "10 projetos mapeados" ao inves de "0h economizadas"

### 6. Ranking

- Incluir projetos atribuidos no calculo do score quando nao ha entregas concluidas

## Detalhes Tecnicos

### Arquivo: `src/hooks/useSkillsLider.ts`

Adicionar nova query para `backlog_skills`:

```text
const { data: projetos } = useQuery({
  queryKey: ["skills-projetos-lider", equipeId],
  queryFn: async () => {
    const { data } = await supabase
      .from("backlog_skills")
      .select("id, titulo, status, responsavel_id, tags, economia_estimada, profiles:responsavel_id(nome_completo)")
      .eq("equipe_id", equipeId)
      .neq("status", "descartado");
    return data || [];
  },
  enabled: !!equipeId,
});
```

Atualizar calculos de ranking e KPIs para considerar projetos quando entregas estao vazias.

Retornar `projetos` no hook.

### Arquivo: `src/components/skills/performance/MemberDonutCharts.tsx`

- Receber nova prop `projetos` (do backlog_skills)
- Para cada membro, mostrar projetos atribuidos quando nao ha entregas
- Exibir contagem: "X projetos atribuidos"
- Donut: usar total de projetos do membro vs projetos com entregas concluidas

### Arquivo: `src/components/skills/performance/StatusPieChart.tsx`

- Receber prop `projetos` como fallback
- Quando entregas vazio, exibir distribuicao de status dos projetos

### Arquivo: `src/components/skills/performance/WeeklyBarChart.tsx`

- Receber prop `projetos` como fallback
- Quando entregas vazio, mostrar projetos atribuidos por membro como barra

### Arquivo: `src/components/skills/ProjetoSkillsPerformance.tsx`

- Buscar `projetos` do hook e passar para os componentes filhos
- Ajustar KPI cards para exibir dados de projetos quando entregas estao vazias

## Arquivos Modificados

- `src/hooks/useSkillsLider.ts` -- adicionar query de backlog_skills e expor projetos
- `src/components/skills/ProjetoSkillsPerformance.tsx` -- passar projetos para subcomponentes + KPIs fallback
- `src/components/skills/performance/MemberDonutCharts.tsx` -- exibir projetos quando sem entregas
- `src/components/skills/performance/StatusPieChart.tsx` -- fallback para projetos
- `src/components/skills/performance/WeeklyBarChart.tsx` -- fallback para projetos

## Resultado

- Dashboards mostram dados de projetos mapeados mesmo antes de gerar entregas
- Erich aparece com seus 8 projetos atribuidos
- Outros membros mostram "Sem projetos atribuidos" ao inves de "Sem entregas"
- Quando entregas forem geradas, os dashboards automaticamente priorizam dados de entregas
- KPIs, ranking, pie chart e barras de maturidade refletem os dados reais do sistema
