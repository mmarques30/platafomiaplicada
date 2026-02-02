

# Plano: Migrar Conteúdo de Criador para a Nova Estrutura

## Problema Identificado

O material que existia na aba "Criadores" (tabela `materiais_comunidade`) **não foi migrado** para a nova tabela `conteudos_dashboard` com tipo `criador`. O conteúdo ainda existe no banco de dados antigo, mas não aparece na nova Central de Conteúdo.

## Dados a Migrar

| Campo | Valor Original | Destino na Central |
|-------|----------------|-------------------|
| titulo | Estrutura e Serviços de FP&A e Controladoria | titulo |
| tipo | template | tipo = `criador` |
| categoria | outro | categoria = `Outro` |
| descricao | (texto sobre FP&A) | resumo + conteudo |
| criador_id | 7d61d3bb-bcb6-42b1-acf0-c2276536d185 | criador_id |
| arquivos_url | [2 arquivos] | arquivos_url |
| ativo | true | ativo |
| ordem | 1 | ordem |
| visibilidade | pago | visivel_gratuitos = false |
| Criador | Livia Pesso | autor = "Livia Pesso" |

## Solução

Executar uma migração SQL para copiar o conteúdo da tabela antiga para a nova, adaptando os campos conforme a nova estrutura.

### SQL de Migração

```sql
INSERT INTO public.conteudos_dashboard (
  tipo,
  titulo,
  resumo,
  conteudo,
  categoria,
  criador_id,
  arquivos_url,
  autor,
  ativo,
  ordem,
  visivel_gratuitos,
  destaque
)
SELECT
  'criador' as tipo,
  titulo,
  LEFT(descricao, 200) as resumo,
  descricao as conteudo,
  CASE 
    WHEN categoria = 'outro' THEN 'Outro'
    WHEN categoria = 'chatgpt' THEN 'ChatGPT'
    WHEN categoria = 'claude' THEN 'Claude'
    WHEN categoria = 'midjourney' THEN 'Midjourney'
    WHEN categoria = 'canva' THEN 'Canva'
    WHEN categoria = 'notion' THEN 'Notion'
    WHEN categoria = 'excel' THEN 'Excel'
    ELSE 'Outro'
  END as categoria,
  criador_id,
  arquivos_url,
  (SELECT nome_completo FROM profiles WHERE id = criador_id) as autor,
  ativo,
  ordem,
  CASE WHEN visibilidade = 'gratuito' THEN true ELSE false END as visivel_gratuitos,
  false as destaque
FROM public.materiais_comunidade
WHERE ativo = true;
```

## Resultado Esperado

Após a migração, o conteúdo de **Livia Pesso** ("Estrutura e Serviços de FP&A e Controladoria") aparecerá na Central de Conteúdo em **Gerenciar Conteúdo > Central** com o tipo "Criador" e categoria "Outro".

## Arquivos a Modificar

| Tipo | Descrição |
|------|-----------|
| Migração SQL | Copiar dados de `materiais_comunidade` para `conteudos_dashboard` |

