

# Corrigir Metricas: Projetos por Semana Real e ROI Exec Travado em 25%

## Problemas Identificados

### 1. Projetos nao refletem os dados reais
A coluna "Projetos" mostra uma distribuicao artificial (1,1,1,1,1,1,1,1,0,0,0,0) que nao tem relacao com os projetos reais. O correto e: para cada semana, contar quantos projetos do backlog TEM ENTREGAS planejadas naquela semana (baseado nos prazos das entregas vinculadas via `backlog_item_id`).

**Dados reais**: Os 8 projetos tem entregas entre semanas 3-5. Entao:
- Semanas 1-2: 0 projetos
- Semana 3: ~8 projetos (todos tem pelo menos 1 entrega nessa faixa)
- Semana 4: ~8 projetos
- Semana 5: ~6 projetos
- Semanas 6-12: 0 projetos

### 2. ROI Executado travado em 25% (bug matematico)
A `economiaTotal` e calculada como `soma(economia_horas_semana) * 4` (multiplicando por 4 para estimar valor mensal), mas `horasRecorrentes` e a soma semanal simples. Quando investimento = 0, o ROI executado e `horasRecorrentes / economiaTotal`, que no maximo da `semanal / (semanal * 4) = 25%`.

**Correcao**: Remover o multiplicador `* 4` da economiaTotal, ou usar a mesma base de comparacao. O correto e comparar horas recorrentes semanais com o total de horas semanais possiveis (sem multiplicar por 4).

### 3. Entregas concentradas em 3 semanas
As 48 entregas tem prazos entre 17/02 e 05/03 -- isso e correto pelos dados. O calculo por semana esta funcionando bem (26 na semana 3, 17 na semana 4, 5 na semana 5). Nao ha bug aqui, apenas reflete a realidade dos prazos gerados.

## Solucao

### Arquivo: `supabase/functions/gerar-metricas-skills/index.ts`

**Projetos por semana (baseado em entregas reais)**:
Em vez de distribuir uniformemente, contar quantos projetos DISTINTOS do backlog tem pelo menos 1 entrega com prazo naquela semana.

```text
// Para cada semana, contar projetos distintos com entregas nesta semana
const projetosIds = new Set(
  entregas
    .filter(e => {
      if (!e.prazo || !e.backlog_item_id) return false;
      const prazo = new Date(e.prazo);
      return prazo >= inicioSemana && prazo < fimSemana;
    })
    .map(e => e.backlog_item_id)
);
const projetosNaSemana = projetosIds.size;
```

**ROI Executado (corrigir base de comparacao)**:
Remover o `* 4` da economiaTotal para que a base de comparacao seja consistente (ambas semanais).

```text
// ANTES (bug): economia semanal * 4 = mensal
const economiaTotal = entregas.reduce((a, e) => a + (e.economia_horas_semana || 0) * 4, 0);

// DEPOIS (correto): economia semanal total (sem multiplicador)
const economiaTotal = entregas.reduce((a, e) => a + (e.economia_horas_semana || 0), 0);
```

## Resultado Esperado

- **Projetos**: 0, 0, 8, 8, 6, 0, 0, 0, 0, 0, 0, 0 (projetos reais com entregas em cada semana)
- **Horas**: 0, 0, 16.25, 32.3, 38.5, 38.5... (sem mudanca, ja esta correto)
- **ROI Exec**: 0, 0, ~42%, ~84%, 100%, 100%... (corrigido, sem trava em 25%)
- **Entregas**: 0/0, 0/0, 0/26, 0/17, 0/5... (sem mudanca, reflete dados reais)

## Arquivo Modificado

- `supabase/functions/gerar-metricas-skills/index.ts` -- projetos baseados em entregas reais por semana e correcao do calculo de ROI (remover multiplicador *4)
