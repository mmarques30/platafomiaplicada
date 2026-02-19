

# Inserir Prompts dos Documentos na Biblioteca de Prompts

## Resumo
Inserir 25 novos prompts e atualizar 3 existentes (BANLIST 1/2/3) na tabela `biblioteca_prompts`, extraidos dos guias dos Modulos 7, 8 e 9. Todos serao prompts independentes na aba Prompts, sem vinculo a modulo.

## Prompts existentes a atualizar (3)

| ID | Titulo atual | Novo titulo | Mudancas |
|---|---|---|---|
| e690cb66... | BANLIST 1 | Email Pedindo Aumento (com Banlist) | titulo, descricao, prompt completo com contexto, tags |
| 53c5de82... | BANLIST 2 | Banlist para Relatorios | titulo, descricao melhorada, tags |
| 89251fc8... | BANLIST 3 | Banlist para Posts LinkedIn | titulo, descricao melhorada, tags |

## Novos prompts a inserir (25)

### Modulo 7 - Prompt Hacks (13 novos, ordem 70-82)
| # | Titulo | Categoria | Nivel |
|---|---|---|---|
| 70 | Banlist para Codigo | Produtividade | iniciante |
| 71 | 5 Comandos de Edicao de Uma Linha | Produtividade | iniciante |
| 72 | Sinal de Maior para Texto a Analisar | Produtividade | iniciante |
| 73 | Barras Duplas para Comentarios Internos | Produtividade | iniciante |
| 74 | Colchetes para Placeholders | Produtividade | iniciante |
| 75 | Tres Tracos para Separar Secoes | Produtividade | iniciante |
| 76 | Aspas Triplas para Texto Longo | Produtividade | iniciante |
| 77 | Resumo dos Simbolos de Escrita | Produtividade | iniciante |
| 78 | Template de Analise de Projeto | Gestao de Projetos | iniciante |
| 79 | Template de Feedback | Comunicacao | iniciante |
| 80 | Template de Decisao entre Opcoes | Gestao de Projetos | iniciante |
| 81 | Template de Daily/Standup | Gestao de Projetos | iniciante |
| 82 | 9 Comandos de Iteracao Rapida | Produtividade | iniciante |

### Modulo 8 - Contexto e Rei (3 novos, ordem 83-85)
| # | Titulo | Categoria | Nivel |
|---|---|---|---|
| 83 | Email de Follow-up B2B (Prompt SEM Contexto) | Vendas | intermediario |
| 84 | Email de Follow-up B2B (Prompt COM Contexto) | Vendas | intermediario |
| 85 | Analise de Desempenho Trimestral (Framework 5 Contextos) | Analise de Dados | intermediario |

### Modulo 9 - Casos Praticos (9 novos, ordem 86-94)
| # | Titulo | Categoria | Nivel |
|---|---|---|---|
| 86 | Email de Cobranca a Fornecedor | Comunicacao | intermediario |
| 87 | Template de Reajuste de Precos Personalizado | Vendas | intermediario |
| 88 | Analise Rapida de Planilha para Reuniao | Analise de Dados | intermediario |
| 89 | Comparativo de Fornecedores | Analise de Dados | intermediario |
| 90 | Post LinkedIn sobre Licao Aprendida | Marketing | intermediario |
| 91 | Estrutura de Apresentacao Executiva | Marketing | avancado |
| 92 | Pesquisa de Mercado Rapida | Vendas | intermediario |
| 93 | Preparacao para Reuniao com Base em Pesquisa | Vendas | intermediario |
| 94 | Analise Competitiva de Concorrentes | Vendas | avancado |

## Detalhes tecnicos

### Ferramentas recomendadas (todos os prompts)
`["ChatGPT", "Claude", "Manus", "Lovable"]`

### Campos preenchidos em cada prompt
- `titulo`: nome descritivo do prompt
- `descricao`: explicacao curta extraida do documento
- `prompt`: texto completo do prompt para copiar
- `categoria`: usando categorias ja existentes na base
- `tags`: array JSON com palavras-chave relevantes (banlist, hack, edicao, escrita, formato, iteracao, contexto, email, dados, conteudo, pesquisa)
- `nivel_complexidade`: iniciante (hacks simples) / intermediario / avancado
- `ferramentas_recomendadas`: ChatGPT, Claude, Manus, Lovable
- `ordem`: sequencial a partir de 70
- `ativo`: true

### Execucao
1. 3 UPDATEs nos prompts BANLIST existentes (melhorar titulo, descricao, prompt completo, tags)
2. 1 INSERT em lote com os 25 novos prompts

