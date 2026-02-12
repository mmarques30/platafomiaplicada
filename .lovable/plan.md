

# Corrigir Metricas: Projetos Acumulando, Horas em 3 Semanas e Entregas Concentradas

## Problemas Identificados

### 1. Projetos acumulando (1,1,2,3,3,4,5,5,6,7,7,8)
A formula `Math.round(totalProjetos * semana / 12)` gera numeros crescentes. O correto e mostrar quantos projetos estao planejados **por semana individual**: com 8 projetos em 12 semanas, cada semana recebe 0 ou 1 projeto.

### 2. Horas economizadas somente em 3 semanas (semanas 3, 4, 5)
O campo `economia_horas_semana` representa economia **recorrente** -- uma vez que a entrega e implementada, ela economiza X horas **toda semana** a partir dali. Atualmente, as horas so aparecem na semana do prazo. O correto e: a partir da semana em que o prazo cai, somar essas horas em TODAS as semanas seguintes.

**Exemplo**: entrega com 1h/semana e prazo na semana 3 deve gerar 1h nas semanas 3, 4, 5, 6, 7, 8, 9, 10, 11 e 12.

### 3. Entregas concentradas em 3 semanas
A IA gerou todos os prazos entre 17/02 e 05/03 (semanas 3-5). Isso e um problema na geracao, mas sera resolvido na metrica ao redistribuir as entregas. As entregas existentes nao precisam ser regeneradas -- o calculo das metricas que precisa tratar isso corretamente com horas recorrentes.

## Solucao

### Arquivo: `supabase/functions/gerar-metricas-skills/index.ts`

**Projetos por semana (nao acumulado)**:
- Distribuir uniformemente: `Math.floor(8/12) = 0` base + 8 semanas recebem 1 extra
- Resultado: 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0

**Horas recorrentes**:
- Para cada semana, somar `economia_horas_semana` de TODAS as entregas cujo prazo ja passou (prazo < fimSemana)
- Isso gera uma curva crescente natural: semana 3 = horas de 14 entregas, semana 5+ = horas de todas as 48 entregas
- Resultado esperado: 0, 0, ~10, ~20, ~38.5, ~38.5, ~38.5... (crescente e depois estavel)

**ROI executado**: Acompanha as horas recorrentes corretamente.

## Detalhes Tecnicos

### Projetos - distribuicao uniforme

```text
const projetosPorSemana = Math.floor(totalProjetos / 12);
const projetosExtras = totalProjetos % 12;
// Semanas 1 ate projetosExtras recebem 1 extra
const projetosNaSemana = projetosPorSemana + (semana <= projetosExtras ? 1 : 0);
```

### Horas - economia recorrente

```text
// Soma economia de TODAS as entregas com prazo ate esta semana (recorrente)
const horasRecorrentes = entregas
  .filter(e => e.prazo && new Date(e.prazo) < fimSemana)
  .reduce((acc, e) => acc + (e.economia_horas_semana || 0), 0);
```

### ROI executado com horas recorrentes

O ROI executado agora usa as horas recorrentes (que crescem e se mantem), resultando em uma curva crescente natural ao inves de picos isolados.

## Arquivo Modificado

- `supabase/functions/gerar-metricas-skills/index.ts` -- projetos por semana (uniforme, nao acumulado) e horas com economia recorrente

## Resultado Esperado

- **Projetos**: 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0 (8 distribuidos uniformemente)
- **Horas**: 0, 0, ~10, ~20, ~38.5, ~38.5, ~38.5... (crescente conforme entregas sao implementadas, depois estavel)
- **ROI**: curva crescente e coerente com a economia real acumulada
