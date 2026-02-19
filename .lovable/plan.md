
# Links clicáveis da MarIAna para trilhas e vídeos

## Objetivo

Fazer a MarIAna gerar links Markdown clicáveis para trilhas e vídeos da plataforma, em vez de apenas mencionar nomes em texto. No frontend, o ReactMarkdown já renderiza links -- basta a IA gerar os links corretos no texto.

## Alterações

### 1. Edge Function: `supabase/functions/ai-chat-user/index.ts`

**Trilhas** (linha ~467): incluir o `id` na query de trilhas (já tem titulo, descricao, nivel) e formatar no prompt com link Markdown:
```
- [Nome da Trilha](/trilhas/{trilha_id}) - descricao
```

**Vídeos** (linha ~534): já temos `id` e `trilhas.id` na query (precisamos adicionar `trilha_id` explicitamente). Formatar com link Markdown:
```
- [Nome do Vídeo](/trilhas/{trilha_id}?video={video_id}) - descrição
```

**Módulos** (linha ~554): incluir `trilha_id` na query e formatar:
```
- [Nome do Módulo](/trilhas/{trilha_id}) - descrição
```

**Instruções ao modelo** (bloco de recomendação ~560): adicionar instrução explícita para usar os links Markdown ao mencionar conteúdos, no formato `[Nome do Conteúdo](/trilhas/xxx)`.

### 2. Frontend: `src/components/shared/MarIAnaChatDrawer.tsx`

Configurar o `ReactMarkdown` para renderizar links (`<a>`) com navegação interna usando `react-router-dom`. Adicionar um `components` override no ReactMarkdown para que links internos (que começam com `/`) usem `navigate()` em vez de recarregar a página.

### 3. Frontend: Mesma lógica para a página `/chat` (se existir ReactMarkdown lá)

Verificar e aplicar o mesmo override de links internos no componente de chat completo para consistência.

## Detalhes técnicos

- Os links serão gerados em Markdown (`[texto](url)`) pela IA e renderizados pelo ReactMarkdown que já está no drawer
- Links internos (começando com `/`) serão interceptados com `onClick` + `navigate()` para evitar reload da página
- Links externos continuam abrindo normalmente com `target="_blank"`
- As URLs seguem o padrão existente: `/trilhas/{trilha_id}` para trilhas e `/trilhas/{trilha_id}?video={video_id}` para vídeos
- A query de trilhas precisa do campo `id` adicionado ao select (atualmente só tem titulo, descricao, nivel)
- A query de vídeos já tem `id` mas precisa de `trilha_id` explícito no select para montar a URL
