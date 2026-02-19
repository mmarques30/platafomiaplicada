

# Corrigir resumo de atualizacoes para incluir conteudos da Central (Noticias, Dicas, etc.)

## Problema

A edge function `gerar-resumo-atualizacoes` agrupa os registros da tabela `conteudos_dashboard` sob o nome generico "Conteudos do Dashboard". Alem disso, o agrupamento por sub-categoria usa o campo `categoria`, mas para conteudos da Central o campo relevante e `tipo` (newsletter, noticia, dica, material). Resultado: as noticias e dicas adicionadas nao aparecem de forma clara no resumo gerado pela IA.

## Solucao

### Arquivo: `supabase/functions/gerar-resumo-atualizacoes/index.ts`

**1. Separar conteudos_dashboard por tipo no mapeamento de nomes**

Ao inves de mapear `conteudos_dashboard` para um nome generico, tratar cada `tipo` como uma secao separada no agrupamento. A logica sera:

- Quando a tabela for `conteudos_dashboard`, usar o campo `tipo` dos dados (dados_novos ou dados_anteriores) para gerar um nome amigavel especifico:
  - `newsletter` -> "Newsletters"
  - `noticia` -> "Noticias"
  - `dica` -> "Dicas"
  - `material` -> "Materiais"
  - `criador` -> "Criadores de Conteudo"

**2. Ajustar a funcao `agruparRegistros`**

Na linha onde o `nomeAmigavel` e definido, adicionar logica especial para `conteudos_dashboard`:

```
// Antes
const nomeAmigavel = TABELA_NOMES[r.tabela] || r.tabela;

// Depois: para conteudos_dashboard, usar o tipo como secao
let nomeAmigavel = TABELA_NOMES[r.tabela] || r.tabela;
if (r.tabela === 'conteudos_dashboard') {
  const tipo = dados.tipo;
  const TIPO_NOMES = {
    newsletter: 'Newsletters',
    noticia: 'Noticias',
    dica: 'Dicas',
    material: 'Materiais da Central',
    criador: 'Criadores de Conteudo',
  };
  nomeAmigavel = TIPO_NOMES[tipo] || 'Central de Conteudos';
}
```

**3. Atualizar o prompt da IA**

Adicionar os novos emojis para as secoes da Central no system prompt:

- Newsletters
- Noticias
- Dicas
- Materiais da Central
- Criadores de Conteudo

Isso garante que a IA saiba formatar corretamente cada tipo de conteudo da Central com emojis apropriados.

## Resultado esperado

Quando o admin gerar o resumo, ao inves de ver "Conteudos do Dashboard", vera secoes separadas como "Noticias: 3 novas noticias adicionadas" e "Dicas: Nova dica sobre ChatGPT", tornando o resumo mais claro e completo.

