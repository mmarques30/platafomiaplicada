
# Inserir prompt "Fusao de Identidade Fotografica" no banco

## O que sera feito

Inserir um novo registro na tabela `biblioteca_prompts` com os dados do prompt fornecido, usando a proxima ordem disponivel (103).

## Dados do registro

| Campo | Valor |
|---|---|
| titulo | Fusao de Identidade Fotografica |
| descricao | Prompt para instruir um modelo de IA a realizar fusao de duas imagens de referencia, extraindo a identidade de uma pessoa e inserindo-a no contexto estetico de outra imagem, gerando um resultado fotorrealista. |
| prompt | Conteudo completo do prompt com todas as secoes (Como Funciona, Instrucao Hibrida, Resultado Esperado) |
| categoria | Produtividade |
| nivel_complexidade | avancado |
| tags | ["geracao de imagem", "fotorrealismo", "fusao de identidade", "IA generativa"] |
| ferramentas_recomendadas | ["ChatGPT", "Manus"] |
| ordem | 103 |
| ativo | true |

## Secao Tecnica

Sera executado um INSERT direto na tabela `biblioteca_prompts` via migracao SQL. Nenhum arquivo de codigo precisa ser alterado -- a biblioteca ja exibe automaticamente os prompts do banco.
