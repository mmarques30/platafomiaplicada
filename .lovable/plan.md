
# Preview do Insight IA por Pessoa no Diagnostico Skills

## O que sera feito

Criar um componente visual que renderiza o `insight_ia` de forma organizada e legivel, substituindo o bloco atual que mostra texto bruto/JSON.

## Estrutura do Insight IA

O campo `insight_ia` contem um JSON rico com as seguintes secoes:
- **Perfil**: cargo, area, nivel tecnico, disponibilidade
- **Processos**: lista de processos com nome, frequencia, impacto, tempo e potencial de automacao
- **Economia**: horas/semana economizadas e valor mensal
- **Insights**: analise geral, oportunidades e primeiros passos
- **Trilha**: modulos sugeridos com prioridade e tempo estimado

## Alteracoes

### Novo componente: `src/components/admin/skills/InsightIAPreview.tsx`

Um componente que recebe o objeto `insight_ia` e renderiza cards organizados:

1. **Header com perfil** - cargo, area, nivel tecnico, disponibilidade (em badges)
2. **Cards de economia** - horas/semana e valor mensal (ja existem, serao integrados)
3. **Tabela de processos** - nome, frequencia, impacto, tempo, barra de potencial de automacao (%)
4. **Secao de analise** - texto da analise com lista de oportunidades e primeiros passos
5. **Trilha sugerida** - modulos com nome, descricao e badge de prioridade + tempo estimado

O componente usara os mesmos padroes visuais do projeto (Card, Badge, Progress).

### Arquivo editado: `src/components/admin/skills/DiagnosticosSkillsTab.tsx`

Substituir o bloco atual de "Resultados IA" (linhas 124-146) pelo novo componente `InsightIAPreview`, passando `membro.insight_ia` como prop.

Os cards de economia que ja existem serao movidos para dentro do novo componente para manter tudo coeso.

## Resultado

Ao expandir um membro processado, o admin vera um preview visual completo e organizado do insight da IA, em vez de texto bruto.
