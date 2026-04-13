

# Fix: Edge Function "delete-user" bloqueada por CORS

## Problema

A Edge Function `delete-user` usa `getCorsHeaders()` que restringe origens a `platafomiaplicada.lovable.app` e `ocwpsanqtfubixerjive.supabase.co`. Quando você acessa pelo preview do Lovable (URL diferente), o browser bloqueia a requisição por CORS antes mesmo de ela chegar na função.

Além disso, os headers permitidos não incluem todos os que o SDK do Supabase envia (`x-supabase-client-platform`, `x-supabase-client-platform-version`, etc.), o que também pode causar falha no preflight.

## Correção

**Arquivo**: `supabase/functions/delete-user/index.ts`

Substituir o uso de `getCorsHeaders()` pelo import padrão do SDK (`corsHeaders` do `@supabase/supabase-js/cors`) que usa `Access-Control-Allow-Origin: *` e inclui todos os headers necessários. A autenticação já é validada via token JWT no código, então a restrição de CORS por origem é redundante.

Alterações:
1. Trocar o import de `getCorsHeaders` para usar `corsHeaders` do SDK
2. Remover a chamada dinâmica `getCorsHeaders(req)` e usar `corsHeaders` diretamente
3. Adicionar `Access-Control-Allow-Methods` no preflight

Isso alinha o `delete-user` com o padrão recomendado para Edge Functions e resolve o erro "Failed to send a request".

