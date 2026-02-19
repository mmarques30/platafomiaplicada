
# Chat inline com a MarIAna (sem navegar para /chat)

## Objetivo

Transformar o botao flutuante da MarIAna em um chat popup/drawer que abre na propria pagina, sem redirecionar para `/chat`. O usuario podera conversar com a IA de qualquer tela da aplicacao.

## Abordagem

Criar um componente de chat inline (drawer/popover) que abre ao clicar no botao flutuante, reutilizando a mesma logica de streaming ja existente em `Chat.tsx`.

## Alteracoes

### 1. Novo componente: `src/components/shared/MarIAnaChatDrawer.tsx`

Componente de chat em formato de painel lateral (drawer) que:
- Abre/fecha com animacao suave (slide up) no canto inferior direito
- Contem header com avatar, nome "MarIAna" e botao de fechar
- Area de mensagens com scroll e suporte a markdown (ReactMarkdown)
- Input de texto com botao de enviar
- Link "Abrir chat completo" que navega para `/chat` caso o usuario queira a tela cheia
- Reutiliza toda a logica de streaming SSE (fetch ao edge function `ai-chat-user`, parsing line-by-line, flushSync)
- Dimensoes: ~380px largura x ~500px altura no desktop, tela quase cheia no mobile

### 2. Atualizar `src/components/shared/MarIAnaFloatingButton.tsx`

- Remover `useNavigate` e a navegacao para `/chat`
- Adicionar estado `isOpen` para controlar a abertura do drawer
- Ao clicar no botao, abrir/fechar o `MarIAnaChatDrawer`
- Renderizar o drawer junto ao botao flutuante
- Esconder o botao quando o drawer estiver aberto

### 3. Sem alteracoes em `MainLayout.tsx`

O `MarIAnaFloatingButton` continua sendo renderizado no mesmo lugar; a mudanca e interna ao componente.

## Detalhes tecnicos

- O chat drawer usa `framer-motion` (ja instalado) para animacao de entrada/saida
- Mensagens do assistente renderizadas com `ReactMarkdown` + `remarkGfm`
- Streaming SSE identico ao `Chat.tsx`: fetch para `ai-chat-user`, parse line-by-line, flushSync para atualizacao progressiva
- Sessao do Supabase obtida via `supabase.auth.getSession()` para autenticacao
- Historico de mensagens mantido apenas em estado local (reset ao fechar)
- AbortController para cancelar requisicoes longas (timeout 120s)
- Tratamento de erros 429 (rate limit) e 402 (creditos) com toast

## Resultado

O usuario podera conversar com a MarIAna de qualquer pagina sem sair do contexto atual. A pagina `/chat` continua funcionando normalmente para quem preferir a experiencia em tela cheia.
