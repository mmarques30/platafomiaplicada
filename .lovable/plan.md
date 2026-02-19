

# Corrigir Resumo de Atualizacoes - Dados incompletos e estrutura ruim

## Problemas identificados

1. **Dados cortados**: Existem 116 registros de auditoria nos ultimos 7 dias, mas o codigo envia apenas 80 para a IA (e busca no maximo 200). Muitos INSERTs de prompts, videos e ia_copie_use ficam de fora.
2. **Prompt da IA generico demais**: O prompt nao instrui a IA a organizar por **categoria/tema** dos itens, nem a usar os nomes corretos das tabelas (ex: `ia_copie_use` deveria aparecer como "IA Copie e Use", `biblioteca_prompts` como "Prompts").
3. **Pre-processamento fraco**: O JSON enviado a IA e uma lista plana sem agrupamento. A IA recebe dados brutos e nao consegue organizar bem.
4. **Categoria nao e enviada**: O campo `categoria` existe nos dados da auditoria mas nao e extraido no mapeamento dos registros.

## Solucao

Alterar o edge function `gerar-resumo-atualizacoes` em 3 frentes:

### 1. Aumentar limite e remover corte arbitrario
- Subir o `.limit(200)` para `.limit(500)` na query
- Remover o `.slice(0, 80)` - usar todos os registros
- Pre-agrupar os dados no backend antes de enviar a IA

### 2. Pre-agrupar dados por tabela/tema no backend
Em vez de enviar uma lista plana, agrupar os registros por tabela e dentro de cada tabela separar por operacao (INSERT vs UPDATE). Incluir o campo `categoria` quando disponivel.

Mapa de nomes amigaveis das tabelas:
- `videos` -> "Videos"
- `modulos` -> "Modulos"
- `trilhas` -> "Trilhas"
- `biblioteca_prompts` -> "Prompts"
- `ia_copie_use` -> "IA Copie e Use"
- `ferramentas_ia` -> "Ferramentas de IA"
- `metodos_aplicar` -> "Metodos para Aplicar"
- `materiais_gratuitos` -> "Materiais Gratuitos"

Formato do JSON enviado a IA:

```text
{
  "periodo": "7 dias",
  "total_alteracoes": 116,
  "por_categoria": {
    "Videos": {
      "adicionados": ["Titulo 1", "Titulo 2"],
      "atualizados": [{"titulo": "X", "campos": ["ordem"]}]
    },
    "Prompts": {
      "adicionados_por_tema": {
        "Vendas": ["Email Follow-up B2B", "Pesquisa de Mercado"],
        "Analise de Dados": ["Relatorio IMRAD", "Comparativo"],
        "Produtividade": ["Aspas Triplas", "Colchetes"]
      }
    },
    "IA Copie e Use": {
      "adicionados": ["Dashboard Financeiro", "Gestao de Rotina"]
    }
  }
}
```

### 3. Melhorar o prompt da IA
Reescrever o system prompt para:
- Organizar o resumo por **secoes tematicas** (Videos, Prompts, IA Copie e Use, etc.)
- Dentro de cada secao, sub-agrupar por categoria/tema quando disponivel
- Usar o formato numerico (ex: "33 novos prompts adicionados") quando ha muitos itens
- Listar por nome quando ha poucos itens (menos de 10)
- Manter formato WhatsApp/Telegram com emojis
- Usar modelo `google/gemini-2.5-flash` (mais capaz que o flash-lite) como primario

### 4. Modelo primario
Trocar de `google/gemini-2.5-flash-lite` para `google/gemini-2.5-flash` para melhor qualidade de texto organizado.

## Arquivo alterado
- `supabase/functions/gerar-resumo-atualizacoes/index.ts`

## O que NAO muda
- Frontend (`ResumoTab.tsx`) continua identico
- Tabela `auditoria_conteudo` inalterada
- Triggers existentes mantidos

