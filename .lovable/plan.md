
# Nova aba "Resumo" no Dashboard Administrativo

## Objetivo
Criar uma aba "Resumo" no Dashboard Admin que gera, via IA, um resumo das ultimas atualizacoes da plataforma (conteudos adicionados, alteracoes, melhorias), estratificado por tipo, pronto para copiar e enviar nos grupos de comunicacao.

## Como funciona

1. Ao abrir a aba, o sistema busca os registros recentes da tabela `auditoria_conteudo` (ultimos 7 ou 30 dias, selecionavel)
2. Agrupa os dados por tabela/tipo (trilhas, modulos, videos, materiais, etc.)
3. Envia para uma edge function que usa Lovable AI para gerar um texto formatado e humanizado, estratificado por categoria
4. Exibe o resultado com botao "Copiar texto" para facilitar o compartilhamento

## Arquivos criados

### 1. `supabase/functions/gerar-resumo-atualizacoes/index.ts`
Edge function que:
- Recebe o periodo desejado (7d ou 30d) e o token do admin
- Consulta `auditoria_conteudo` agrupando por tabela e operacao
- Para cada registro INSERT/UPDATE, busca `dados_novos` para extrair titulos dos itens
- Monta um prompt pedindo a IA para gerar um resumo organizado por categoria:
  - **Videos**: novos videos adicionados, videos atualizados
  - **Modulos**: novos modulos, alteracoes
  - **Trilhas**: novas trilhas, alteracoes
  - **Materiais Gratuitos**: novos materiais
  - **Outros**: qualquer outra tabela auditada
- Retorna o texto gerado em markdown
- Modelo: `google/gemini-3-flash-preview` (rapido e eficiente para sumarizacao)

### 2. `src/components/admin/dashboard/ResumoTab.tsx`
Componente da aba com:
- Seletor de periodo (ultimos 7 dias / ultimos 30 dias)
- Botao "Gerar Resumo" que chama a edge function
- Area de exibicao do resumo gerado (renderizado em markdown)
- Botao "Copiar texto" que copia o conteudo para a area de transferencia
- Estado de loading com skeleton
- Exibicao da data/hora da ultima geracao

## Arquivos modificados

### 3. `src/pages/admin/AdminDashboard.tsx`
- Importar `ResumoTab` e o icone `FileText` do lucide-react
- Adicionar nova `TabsTrigger` com valor "resumo" e icone `FileText`
- Adicionar novo `TabsContent` renderizando `<ResumoTab />`

## Detalhes tecnicos

### Prompt para a IA
```text
Voce e um assistente que gera resumos de atualizacoes de plataforma educacional.
Recebera uma lista de alteracoes recentes organizadas por tipo.
Gere um resumo claro e organizado, em portugues, pronto para ser compartilhado
em grupos do WhatsApp/Telegram.

Use emojis para cada categoria. Formato:
- Titulo com periodo
- Secoes por tipo (Videos, Modulos, Trilhas, Materiais)
- Para cada secao, liste os itens adicionados ou alterados com seus titulos
- Finalize com um breve destaque motivacional

NAO invente dados. Use apenas as informacoes fornecidas.
```

### Dados enviados a IA
```text
{
  periodo: "7 dias" | "30 dias",
  alteracoes: [
    { tabela: "videos", operacao: "INSERT", titulo: "...", data: "..." },
    { tabela: "modulos", operacao: "UPDATE", titulo: "...", campos: [...], data: "..." },
    ...
  ]
}
```

### Config.toml
Adicionar entrada para a nova edge function:
```toml
[functions.gerar-resumo-atualizacoes]
verify_jwt = true
```
