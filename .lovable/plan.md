
# Gerar Metricas Semanais com IA

## Resumo

Criar uma edge function que usa IA para gerar metricas semanais baseadas nos projetos e entregas validados da equipe, com foco em ROI e aderencia planejado vs executado. Adicionar botao "Gerar Metricas com IA" na tab de metricas do admin.

## Como funciona

A IA recebe os projetos do backlog, entregas (com status, economia de horas, prazo, progresso), dados da equipe (investimento, custo hora, semana atual) e o roadmap. Com base nisso, distribui as metricas semana a semana:

- **ROI Projetado**: calculo ideal baseado na economia total estimada das entregas vs investimento, distribuido pelas 12 semanas de forma incremental
- **ROI Executado**: baseado nas entregas efetivamente concluidas e em andamento ate cada semana
- **Entregas planejadas vs concluidas**: quantas deveriam estar prontas vs quantas estao
- **Horas economizadas**: acumulo semanal com base nas entregas finalizadas
- **Processos automatizados**: contagem incremental por semana
- **Indice de maturidade**: evolucao percentual da equipe
- **Engajamento trilhas**: estimativa baseada no progresso das entregas

## Detalhes Tecnicos

### 1. Nova edge function: `gerar-metricas-skills`

Recebe `equipe_id`. Busca:
- `equipes_skills` (investimento, custo_hora_padrao, semana_atual)
- `backlog_skills` (projetos com status != "descartado")
- `entregas_skills` (entregas com status, economia_horas_semana, prazo, progresso, concluido_em)
- `roadmap_skills` (fases com semana_inicio e semana_fim)

Envia para a IA via tool calling com schema:

```text
metricas: [
  {
    semana: number (1-12),
    horas_economizadas: number,
    processos_automatizados: number,
    entregas_concluidas: number,
    entregas_planejadas: number,
    indice_maturidade: number (0-100),
    roi_projetado: number (%),
    roi_executado: number (%),
    engajamento_trilhas: number (0-100)
  }
]
```

O prompt instrui a IA a:
- Gerar metricas para as 12 semanas do programa
- Calcular ROI projetado com base na economia total de horas estimada x custo hora x 4 semanas / investimento
- Distribuir ROI de forma incremental (semana 1 baixo, semana 12 alvo total)
- ROI executado baseado em entregas ja concluidas (status "concluida" ou "rodando")
- Entregas planejadas baseadas no roadmap/prazos
- Maturidade crescente de ~20% (semana 1) a ~80-100% (semana 12)

Apos receber, faz DELETE das metricas existentes e INSERT das novas.

### 2. Botao "Gerar Metricas com IA" no `SkillsMetricasTab.tsx`

Adicionar botao com icone `Sparkles` ao lado de "Nova Metrica". Ao clicar:
- Chama a edge function `gerar-metricas-skills`
- Mostra loading
- Invalida query e atualiza tabela
- Toast de sucesso/erro

### 3. Registrar no `supabase/config.toml`

```text
[functions.gerar-metricas-skills]
verify_jwt = false
```

## Arquivos

**Novos:**
- `supabase/functions/gerar-metricas-skills/index.ts`

**Modificados:**
- `src/components/admin/skills/SkillsMetricasTab.tsx` -- botao "Gerar Metricas com IA"
- `supabase/config.toml` -- registrar nova function

## Resultado

- Admin clica "Gerar Metricas com IA"
- IA analisa projetos, entregas e roadmap da equipe
- Gera 12 semanas de metricas com ROI projetado vs executado
- Metricas ficam visiveis na tabela e alimentam o dashboard de performance
