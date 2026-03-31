

# Curadoria Semanal com Perplexity na Central de Conteúdo

## Visão geral

Criar um fluxo onde o admin clica "Gerar Curadoria Semanal" no painel, a IA (Perplexity Sonar Pro) pesquisa e retorna conteúdo estruturado para cada aba da Central (Notícias IA, Dicas Práticas, Newsletter), o admin revisa/edita cada item e aprova os que deseja publicar — inserindo-os na tabela `conteudos_dashboard`.

## Etapas

### 1. Armazenar API key do Perplexity
Usar o conector Perplexity para vincular a chave ao projeto. A chave ficará disponível como `PERPLEXITY_API_KEY` nas edge functions.

### 2. Edge Function: `gerar-curadoria-semanal`
- Recebe do frontend qual(is) categoria(s) gerar
- Faz 3 chamadas ao Perplexity (`sonar-pro`) com prompts específicos por aba:
  - **Notícias IA**: Panorama semanal + top stories (startups, funding, ferramentas, impacto mercado)
  - **Dicas Práticas**: Hacks e aplicações derivadas dos lançamentos da semana
  - **Newsletter**: Top 5 histórias para infotenimento — conflito, narrativa, ângulos de conteúdo
- Usa `response_format: json_schema` para retornar array estruturado com `titulo`, `resumo`, `conteudo`, `link_externo`, `tags`, `autor` (fonte)
- Inclui `search_recency_filter: 'week'` para garantir fontes dos últimos 7 dias
- Retorna o JSON organizado por tipo, pronto para revisão

### 3. Admin UI: Nova aba "Curadoria IA" no GerenciarConteudo
Adicionar uma nova tab `curadoria` na página de conteúdo admin com:

- **Botão "Gerar Curadoria Semanal"** que chama a edge function
- **3 seções** (Notícias, Dicas, Newsletter), cada uma com cards dos itens gerados
- Cada card mostra: título, resumo, tags, fonte — com ações:
  - **Editar** (inline) — ajustar título/resumo antes de publicar
  - **Aprovar** ✓ — insere na `conteudos_dashboard` como `ativo: true` com o tipo correspondente
  - **Descartar** ✗ — remove da lista de sugestões
- Status visual: pendente / aprovado / descartado
- Não persiste a curadoria em tabela separada (state local apenas durante a sessão de revisão)

### 4. Estrutura dos prompts por aba

| Aba | Prompt (resumo) | Tipo na DB |
|-----|-----------------|------------|
| Notícias IA | Panorama semanal: startups, funding, ferramentas, impacto mercado/liderança. Fontes citadas. | `noticia` |
| Dicas Práticas | Hacks de IA derivados da semana: workflows, aplicações para gestores/creators. | `dica` |
| Newsletter | Top 5 histórias: conflito, narrativa, ângulos para roteiros/posts. | `newsletter` |

### 5. Arquivos

- **Novo**: `supabase/functions/gerar-curadoria-semanal/index.ts`
- **Novo**: `src/components/admin/content/CuradoriaIATab.tsx`
- **Novo**: `src/hooks/admin/useCuradoriaIA.ts`
- **Editado**: `src/pages/admin/GerenciarConteudo.tsx` — adicionar tab "Curadoria IA"

### Detalhes técnicos

A edge function valida JWT + role admin, chama Perplexity 3x em paralelo (Promise.all), cada chamada com structured output (json_schema) para garantir formato parseável. O frontend faz `supabase.functions.invoke('gerar-curadoria-semanal')` e renderiza os resultados para aprovação. Ao aprovar, usa o hook `useCreateConteudo` existente para inserir na `conteudos_dashboard`.

