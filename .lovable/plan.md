

# Corrigir Metricas: Renomear "Processos" para "Projetos" e Vincular Entregas

## Problemas Identificados

### 1. Campo "processos_automatizados" deveria ser "projetos"
A coluna `processos_automatizados` na tabela `metricas_skills` armazena a contagem de projetos do backlog, nao de processos genericos. Todo o sistema (edge function, UI admin, hook do lider) usa o nome errado.

### 2. Metricas geradas com valores zerados
Os dados atuais mostram que TODAS as 12 semanas tem `entregas_concluidas = 0`, `entregas_planejadas = 0`, `horas_economizadas = 0` e `processos_automatizados = 0`. A IA nao esta usando os dados reais das entregas para calcular as metricas.

**Dados reais disponiveis**: 20 entregas com prazos entre 17/02 e 02/03, cada uma com `economia_horas_semana` definida (0.1 a 2h). 8 projetos no backlog com `horas_estimadas_economia` definidas.

### 3. Metricas nao refletem as entregas por semana
As entregas tem prazos que deveriam definir em qual semana cada entrega e planejada. A edge function envia os dados para a IA mas a IA retorna valores zerados.

## Solucao

### 1. Migration: Renomear coluna `processos_automatizados` para `projetos_concluidos`

Renomear a coluna no banco de dados para refletir corretamente o que ela representa.

### 2. Refatorar edge function `gerar-metricas-skills`

Ao inves de depender da IA para calcular os valores (que retorna zeros), calcular as metricas de forma deterministica em codigo:

- **entregas_planejadas por semana**: contar entregas cujo `prazo` cai dentro de cada semana (baseado na `data_inicio` da equipe)
- **entregas_concluidas por semana**: contar entregas com `concluido_em` dentro de cada semana
- **horas_economizadas**: acumulado semanal de `economia_horas_semana` das entregas concluidas
- **projetos_concluidos**: contagem incremental de projetos do backlog com status "concluido"
- **roi_projetado**: calculado com formula (economia total estimada / investimento) distribuido nas 12 semanas
- **roi_executado**: baseado nas entregas realmente concluidas

Manter a IA apenas para `indice_maturidade` e `engajamento_trilhas` (estimativas qualitativas).

### 3. Atualizar UI e hooks

Renomear todas as referencias de `processos_automatizados`/`processosAutomatizados` para `projetos_concluidos`/`projetosConcluidos`.

## Detalhes Tecnicos

### Migration SQL

```text
ALTER TABLE public.metricas_skills 
RENAME COLUMN processos_automatizados TO projetos_concluidos;
```

### Edge Function: calculo deterministico

```text
// Calcular data de inicio de cada semana
const dataInicio = new Date(equipe.data_inicio || equipe.created_at);

for (let semana = 1; semana <= 12; semana++) {
  const inicioSemana = addWeeks(dataInicio, semana - 1);
  const fimSemana = addWeeks(dataInicio, semana);
  
  // Entregas planejadas: prazo <= fimSemana (acumulado)
  const planejadas = entregas.filter(e => new Date(e.prazo) <= fimSemana).length;
  
  // Entregas concluidas: concluido_em <= fimSemana (acumulado)
  const concluidas = entregas.filter(e => e.concluido_em && new Date(e.concluido_em) <= fimSemana).length;
  
  // Horas economizadas: soma economia_horas_semana das concluidas
  const horas = entregas
    .filter(e => e.concluido_em && new Date(e.concluido_em) <= fimSemana)
    .reduce((acc, e) => acc + (e.economia_horas_semana || 0), 0);
  
  // Projetos concluidos (do backlog)
  const projetos = backlog.filter(p => p.status === 'concluido').length;
  
  // ROI projetado: distribuicao crescente do alvo
  const economiaTotal = entregas.reduce((a, e) => a + (e.economia_horas_semana || 0) * 4, 0);
  const roiAlvo = (economiaTotal * custoHora / investimento) * 100;
  const roiProjetado = roiAlvo * (semana / 12);
  
  // ROI executado: baseado em entregas concluidas
  const economiaReal = horas * custoHora;
  const roiExecutado = (economiaReal / investimento) * 100;
}
```

### Arquivos modificados

- **Migration SQL** -- renomear `processos_automatizados` para `projetos_concluidos`
- `supabase/functions/gerar-metricas-skills/index.ts` -- calculo deterministico das metricas baseado nas entregas reais
- `src/components/admin/skills/SkillsMetricasTab.tsx` -- renomear campo "Processos" para "Projetos"
- `src/hooks/admin/useSkillsPerformanceAdmin.ts` -- renomear campo no mutation
- `src/hooks/useSkillsLider.ts` -- renomear `processosAutomatizados` para `projetosConcluidos`

## Resultado

- Coluna renomeada para "Projetos Concluidos" (reflete projetos do backlog, nao processos genericos)
- Metricas calculadas com dados reais das entregas (prazos, economia de horas, status)
- Entregas planejadas por semana baseadas nos prazos reais
- ROI calculado deterministicamente com base na economia real vs investimento
- IA usada apenas para estimativas qualitativas (maturidade e engajamento)
