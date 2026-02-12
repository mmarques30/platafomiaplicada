

# Corrigir Metricas: Projetos nao associados e numeros estranhos

## Problemas Identificados

### 1. Projetos sempre zerados
A coluna `projetos_concluidos` filtra por `status === "concluido"`, mas todos os 8 projetos tem status `levantado`. A metrica deveria mostrar o total de projetos existentes (nao apenas concluidos), distribuidos progressivamente ao longo das 12 semanas como planejamento.

### 2. Entregas com numeros estranhos (0, 0, 26, 43, 48, 48...)
O calculo atual e **acumulativo** (todas as entregas com prazo ate a semana X), o que faz os numeros saltarem de 0 para 26 de uma semana para outra. O correto e mostrar quantas entregas estao **planejadas para cada semana individualmente**, nao acumulado.

### 3. Dados da equipe
- `data_inicio` e NULL, entao usa `created_at` (02/02)
- `investimento` e 0, entao ROI fica distorcido
- 48 entregas, todas com prazo entre 17/02 e 05/03

## Solucao

### Refatorar `gerar-metricas-skills/index.ts`

**Entregas planejadas**: Contar entregas cujo `prazo` cai **dentro** de cada semana (nao acumulado). Isso distribui as 48 entregas entre as semanas de forma realista.

**Entregas concluidas**: Contar entregas com `concluido_em` **dentro** de cada semana (nao acumulado).

**Projetos (backlog)**: Distribuir os projetos do backlog ao longo das 12 semanas proporcionalmente. Ex: 8 projetos em 12 semanas = ~1 projeto a cada 1.5 semanas. Usar distribuicao progressiva para que todos os projetos aparecam ao longo do roadmap.

**Horas economizadas**: Calcular por semana individual (nao acumulado), baseado nas entregas planejadas para aquela semana.

**ROI**: Quando investimento = 0, usar a economia total estimada como referencia ao inves de dividir por zero.

## Detalhes Tecnicos

### Logica de distribuicao por semana

```text
// Entregas POR semana (nao acumulado)
const inicioSemana = addWeeks(dataInicio, semana - 1);
const fimSemana = addWeeks(dataInicio, semana);

const planejadas = entregas.filter(e => {
  const prazo = new Date(e.prazo);
  return prazo >= inicioSemana && prazo < fimSemana;
}).length;

// Projetos distribuidos progressivamente
const projetosPorSemana = Math.floor(totalProjetos * semana / 12);

// Horas economizadas por semana (soma das entregas daquela semana)
const horasSemana = entregasDaSemana
  .reduce((acc, e) => acc + (e.economia_horas_semana || 0), 0);
```

### Tratamento de investimento zero

Quando investimento = 0, calcular ROI como percentual de economia alcancada vs economia total estimada, ao inves de dividir por zero.

## Arquivos Modificados

- `supabase/functions/gerar-metricas-skills/index.ts` -- corrigir calculo de entregas por semana (nao acumulado), distribuir projetos progressivamente, tratar investimento zero

## Resultado

- Entregas planejadas mostram quantas sao esperadas **por semana** (ex: semana 3 = 14, semana 4 = 12)
- Projetos aparecem distribuidos ao longo das 12 semanas (crescente)
- Horas economizadas refletem a economia de cada semana individual
- ROI funciona mesmo com investimento = 0

