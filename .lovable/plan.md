
# Corrigir ordenacao dos Prompts

## Problema
A coluna `ordem` da tabela `biblioteca_prompts` tem valores repetidos (ex: nove prompts com `ordem=1`, sete com `ordem=2`, etc.). Isso acontece porque cada lote de insercao comecou a numeracao do 1. O resultado e que a lista nao reflete a sequencia real de adicao.

## Solucao
Executar uma migracao SQL que renumera todos os 69 prompts sequencialmente (1 a 69), usando a data de criacao (`created_at`) como criterio de ordenacao. Assim, os mais antigos ficam primeiro e cada prompt tera um numero unico.

## Detalhes tecnicos

### Migracao SQL
```sql
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS nova_ordem
  FROM biblioteca_prompts
)
UPDATE biblioteca_prompts
SET ordem = numbered.nova_ordem
FROM numbered
WHERE biblioteca_prompts.id = numbered.id;
```

Essa query:
1. Ordena todos os prompts por `created_at` (data de criacao)
2. Atribui uma numeracao sequencial de 1 a 69
3. Atualiza a coluna `ordem` com o novo valor unico

### Nenhum arquivo de codigo precisa ser alterado
A pagina `BibliotecaPrompts.tsx` ja ordena por `ordem` no frontend. Basta corrigir os dados no banco.
