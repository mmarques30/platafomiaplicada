

## Plano de Execução

### 1. Corrigir CORS (`supabase/functions/_shared/cors.ts`)

Substituir todo o conteúdo por:

```typescript
const ALLOWED_ORIGINS = [
  "https://platafomiaplicada.lovable.app",
  "https://ocwpsanqtfubixerjive.supabase.co",
];

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/.*\.lovable\.app$/,
  /^http:\/\/localhost:\d+$/,
];

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin)
    || ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
```

### 2. Deploy de TODAS as edge functions (46 functions)

Deploy em lote de todas as functions listadas em `supabase/functions/`.

### 3. Testar via curl

- `reset-user-password` — POST com auth token do admin
- `delete-user` — POST com auth token do admin

Confirmar que ambas retornam 200 com CORS headers corretos.

