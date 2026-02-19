

# Inserir Templates de Relatorios na Biblioteca de Prompts

## Resumo
Adicionar 8 novos prompts extraidos do documento "Biblioteca de Templates para Relatorios" na tabela `biblioteca_prompts`, com ordem sequencial a partir de 95.

## Prompts a inserir (8)

| Ordem | Titulo | Categoria | Nivel |
|---|---|---|---|
| 95 | Relatorio Executivo IMRAD (Harvard/MIT) | Analise de Dados | intermediario |
| 96 | Relatorio Piramidal - Conclusoes Primeiro (Stanford) | Analise de Dados | avancado |
| 97 | Analise de Dados PSB - Problem-Solution-Benefit (Oxford) | Analise de Dados | intermediario |
| 98 | Relatorio de Progresso SCQA (Berkeley) | Gestao de Projetos | intermediario |
| 99 | Relatorio de Analise Competitiva | Vendas | avancado |
| 100 | Prompt de Refinamento - Aprofundar Analise | Analise de Dados | iniciante |
| 101 | Prompt de Refinamento - Melhorar Apresentacao | Comunicacao | iniciante |
| 102 | Prompt de Refinamento - Adaptar por Audiencia | Comunicacao | iniciante |

## Detalhes

### Campos preenchidos
- `titulo`: nome descritivo do template
- `descricao`: descricao + casos de uso extraidos do documento
- `prompt`: texto completo do template de prompt para copiar
- `categoria`: Analise de Dados, Gestao de Projetos, Vendas ou Comunicacao
- `tags`: palavras-chave como relatorio, template, IMRAD, piramidal, PSB, SCQA, competitiva, refinamento
- `nivel_complexidade`: iniciante (refinamentos simples), intermediario ou avancado
- `ferramentas_recomendadas`: ChatGPT, Claude, Manus, Lovable
- `ordem`: 95 a 102
- `ativo`: true

### Execucao
1 INSERT em lote com os 8 novos prompts diretamente na tabela `biblioteca_prompts`

