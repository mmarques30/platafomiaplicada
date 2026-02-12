

# Reformular Metricas: Sistema de Metas Padrao + Acompanhamento de Execucao

## Conceito

Em vez de tentar encaixar dados reais em formulas artificiais, o sistema vai funcionar em duas camadas:

1. **METAS (o que deveria acontecer)** -- calculo padrao baseado no produto: 8 projetos, 48 entregas, 12 semanas
2. **EXECUCAO (o que realmente aconteceu)** -- leitura dos dados reais de conclusao

Isso permite comparar planejado vs realizado em todas as dimensoes.

## Logica das Metas Padrao

### Entregas (meta vs real)
- **Meta semanal**: 48 entregas / 12 semanas = **4 entregas/semana** (distribuicao uniforme)
- **Real semanal**: contagem de entregas com `concluido_em` dentro da semana
- Campo `entregas_planejadas` = 4 (meta fixa)
- Campo `entregas_concluidas` = real (do banco)

### Projetos (meta vs real)
- Cada projeto tem 6 entregas. Com meta de 4 entregas/semana, 1 projeto completa a cada ~1.5 semanas
- **Meta**: distribuir 8 projetos uniformemente -- semanas 1,2,3,4,5,6,8,9 recebem 1 projeto cada
- **Real**: projetos que tiveram TODAS as entregas concluidas ate aquela semana
- Campo `projetos_concluidos` = meta de projetos que deveriam estar completos ATE esta semana (acumulado)

### Horas Economizadas (meta acumulativa)
- Cada projeto tem um `horas_estimadas_economia` semanal (ex: Projeto 1 = 4h/sem, Projeto 2 = 4h/sem)
- **Meta**: conforme cada projeto "deveria" ser concluido (pela meta), sua economia semanal se soma permanentemente
- Semana 2 (1 projeto concluido): 4h/sem
- Semana 3 (2 projetos concluidos): 8h/sem
- Semana 12 (8 projetos): 20h/sem (soma de todos os `horas_estimadas_economia`)
- **Real**: soma de `economia_horas_semana` das entregas efetivamente concluidas (recorrente)

### ROI (meta vs real)
- **ROI Projetado (meta)**: progressao linear ate o ROI alvo
  - Se investimento > 0: `(economia_acumulada_meta * custo_hora) / investimento * 100`
  - Se investimento = 0: progressao linear de 0% a 100% em 12 semanas
- **ROI Executado (real)**: baseado na economia real das entregas concluidas
  - `(economia_real_acumulada * custo_hora) / investimento * 100`

### Indice de Maturidade
- **Meta**: progressao linear de 20% (semana 1) a 90% (semana 12)
- **Real**: ajustado pela taxa de conclusao de entregas. Se esta no ritmo da meta, acompanha. Se atrasado, fica abaixo.

### Engajamento
- Baseado na proporcao de entregas em andamento + concluidas vs total, ponderado pela semana

## Exemplo com Dados Atuais (8 projetos, 48 entregas)

Ordenando projetos por prioridade e economia:

| Sem | Entregas Meta/Real | Proj Meta (acum) | Horas Meta | ROI Proj | ROI Exec |
|-----|-------------------|------------------|------------|----------|----------|
| 1   | 4 / 0             | 1                | 4.0        | 8.3%     | 0%       |
| 2   | 4 / 0             | 1                | 4.0        | 16.7%    | 0%       |
| 3   | 4 / 0             | 2                | 8.0        | 25.0%    | 0%       |
| 4   | 4 / 0             | 3                | 11.0       | 33.3%    | 0%       |
| 5   | 4 / 0             | 3                | 11.0       | 41.7%    | 0%       |
| 6   | 4 / 0             | 4                | 15.0       | 50.0%    | 0%       |
| 7   | 4 / 0             | 5                | 17.0       | 58.3%    | 0%       |
| 8   | 4 / 0             | 5                | 17.0       | 66.7%    | 0%       |
| 9   | 4 / 0             | 6                | 19.0       | 75.0%    | 0%       |
| 10  | 4 / 0             | 7                | 19.5       | 83.3%    | 0%       |
| 11  | 4 / 0             | 7                | 19.5       | 91.7%    | 0%       |
| 12  | 4 / 0             | 8                | 20.0       | 100%     | 0%       |

Conforme entregas forem concluidas, o ROI Executado sobe e se aproxima do Projetado.

## Beneficios

- **Metas sao fixas e previssiveis**: nao dependem das datas dos prazos das entregas (que podem estar concentradas)
- **Execucao e real**: reflete o que de fato foi feito
- **Se mudar datas**: as metas continuam as mesmas (sao padrao do produto), so a execucao muda
- **Comparacao clara**: lider ve facilmente se esta adiantado ou atrasado vs meta

## Detalhes Tecnicos

### Arquivo modificado
- `supabase/functions/gerar-metricas-skills/index.ts`

### Logica principal

```text
// Metas padrao
const entregasMetaSemana = Math.ceil(totalEntregas / 12); // 4/semana
const projetosOrdenados = backlog ordenado por prioridade
// Cada projeto completa quando suas 6 entregas cabem na timeline
// Com 4 entregas/semana, projeto 1 completa ~semana 1.5, projeto 2 ~semana 3, etc.

for (semana 1..12) {
  // META: entregas planejadas = 4 (fixo)
  // META: projetos acumulados = quantos projetos deveriam estar prontos ate esta semana
  // META: horas = soma de horas_estimadas_economia dos projetos concluidos na meta
  // META: ROI projetado = progressao linear

  // REAL: entregas concluidas = count(concluido_em dentro da semana)
  // REAL: horas = soma recorrente de economia das entregas concluidas
  // REAL: ROI executado = economia real / investimento (ou economia total)
}
```

### Distribuicao de projetos na meta
Ordenar projetos por prioridade (alta > media > baixa), depois por economia (maior primeiro). Calcular em qual semana cada projeto "deveria" estar concluido se entregas forem uniformes (4/semana):
- Projeto 1 (6 entregas): concluido na semana ceil(6/4) = semana 2
- Projeto 2: concluido na semana ceil(12/4) = semana 3
- Projeto 3: concluido na semana ceil(18/4) = semana 5
- ...ate projeto 8 na semana ceil(48/4) = semana 12

