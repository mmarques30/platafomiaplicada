
# Historico Persistente no Drawer da MarIAna

## Problema atual

1. O drawer inicia sempre vazio (`useState<Message[]>([])`) -- nenhum historico e carregado
2. O bloco de salvamento (linha 182-193) salva TODAS as mensagens do array a cada troca, causando duplicatas massivas na tabela `chat_messages`
3. Ao fechar e reabrir o drawer, a conversa se perde completamente

## Alteracoes

### `src/components/shared/MarIAnaChatDrawer.tsx`

#### 1. Carregar historico ao abrir (useEffect)

Adicionar um `useEffect` que roda quando o componente monta (e `user` esta disponivel):

- Query: `supabase.from("chat_messages").select("role, content, created_at").eq("user_id", user.id).order("created_at", { ascending: true }).limit(50)`
- Carregar as ultimas 50 mensagens no state `messages`
- Adicionar estado `isLoadingHistory` para mostrar um spinner enquanto carrega

#### 2. Corrigir salvamento duplicado

O bloco atual (linhas 182-193) salva o array inteiro de mensagens a cada resposta. Corrigir para salvar APENAS as 2 novas mensagens (a do usuario e a da assistente):

```
// Antes (ERRADO - salva tudo de novo):
const finalMessages = [...messagesToSend, { role: "assistant", ... }];
await Promise.all(finalMessages.map(...));

// Depois (CORRETO - salva so as novas):
await supabase.from("chat_messages").insert([
  { user_id: user.id, role: "user", content: messageToSend },
  { user_id: user.id, role: "assistant", content: assistantContent },
]);
```

#### 3. Botao "Nova conversa"

Adicionar um botao no header (ao lado do botao de maximizar) que:
- Limpa o state `messages` para `[]`
- Nao apaga mensagens do banco (historico persiste)
- Mostra as sugestoes iniciais novamente

#### 4. Estado de carregamento

Enquanto o historico carrega, exibir um skeleton/spinner em vez da tela vazia com sugestoes. Apos carregar:
- Se tem mensagens: exibe o historico
- Se nao tem: exibe as sugestoes normalmente

### Limpeza de duplicatas (opcional)

Rodar uma query SQL para limpar as duplicatas existentes na tabela `chat_messages`, mantendo apenas a primeira ocorrencia de cada mensagem por usuario.

## Resultado

- O drawer abre com a conversa anterior restaurada
- Novas mensagens sao salvas sem duplicacao
- O usuario pode iniciar uma nova conversa limpa quando quiser
- A pagina `/chat` completa tambem pode se beneficiar desse mesmo historico
