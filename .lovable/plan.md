

# Corrigir erro "Failed to send a request to the Edge Function" no parse-aditivo-contrato

## Problema
A edge function `parse-aditivo-contrato` está falhando com "Failed to fetch" porque os CORS headers estão incompletos. O cliente Supabase envia headers adicionais (`x-supabase-client-platform`, etc.) que não estão sendo permitidos.

## Correção

### Arquivo: `supabase/functions/parse-aditivo-contrato/index.ts`
Atualizar o `corsHeaders` para incluir todos os headers necessários:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

Apenas essa mudança na linha 4-6 do arquivo resolve o problema.

