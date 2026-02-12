

# Corrigir Distribuição de Projetos e Entregas - Equipe Inovação

## Problema

A IA associou 5 dos 7 projetos ao Erich (TI) e deixou Antonio e Lucio com zero itens, apesar de vários projetos serem diretamente dos processos deles.

## Distribuição Atual vs Correta

| Projeto | Atual | Correto | Motivo |
|---------|-------|---------|--------|
| Automação Abertura de RAIVs | Erich | **Antonio** | Processo diário dele |
| Automação Abertura de Sinistros | Erich | **Antonio** | Processo semanal dele |
| Planejamento Orçamentário Frota | Erich | **Antonio** | Processo mensal dele |
| Monitoramento Falhas Power BI | Erich | **Lucio** | Processo diário dele |
| Validação Dados AllStrategy para BI | Erich | **Lucio** | Processo semanal dele |
| Análise/Gráficos DFC | Livia | Livia | OK |
| Relatório Mensal de Resultados | Livia | Livia | OK |

## Correções por UPDATE direto

Serão feitos UPDATEs nas tabelas `backlog_skills` e `entregas_skills` para:

**Para Antonio (338e43eb):**
- 3 projetos: RAIVs, Sinistros, Planejamento Frota
- Entregas vinculadas a esses projetos (Mapeamento RAIVs, Classificação E-mails, Análise Padrões Sinistro, Script Custos Históricos, Consolidação Bases CSV, OCR Fotos)

**Para Lucio (d068fff0):**
- 2 projetos: Falhas Power BI, Validação AllStrategy
- Entregas vinculadas (Inventário Painéis Power BI, Alertas Power BI, Divergência AllStrategy, Comparação Dados)

**Mantém Erich:** Nenhum projeto (seus processos são gestão estratégica/fornecedores, sem projeto específico gerado)

**Mantém Livia:** 2 projetos + 4 entregas (DFC e Relatório Mensal)

## Ajuste na Edge Function

Além da correção de dados, o prompt da edge function `associar-membros-skills` será ajustado para enfatizar que a IA deve priorizar o dono do processo (quem executa a tarefa no diagnóstico) e não apenas a área geral.

## Arquivos Modificados

- `supabase/functions/associar-membros-skills/index.ts` -- ajustar prompt para distribuição mais precisa
- Dados corrigidos via UPDATE direto nas tabelas `backlog_skills` e `entregas_skills`

## Resultado

- Antonio: 3 projetos + 6 entregas
- Lucio: 2 projetos + 4 entregas
- Livia: 2 projetos + 4 entregas
- Erich: 0 projetos + 0 entregas (processos dele são de gestão, sem projetos técnicos gerados)

