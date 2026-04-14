
Diagnóstico
- A função `reset-user-password` está deployada e ativa: há logs recentes com `Reset User Password function started`.
- O erro não é de ausência de deploy nem de banco. O frontend recebe `FunctionsFetchError`, que indica falha de fetch/CORS antes de conseguir ler a resposta.
- A diferença entre as funções confirma isso: `reset-user-password` usa `getCorsHeaders()` de `_shared/cors.ts`, enquanto `delete-user` usa `Access-Control-Allow-Origin: *`.
- O helper compartilhado ficou restritivo demais. Ele só aceita `*.lovable.app`, mas o runtime do app também aparece em `*.lovableproject.com`. Quando a origem não bate, a função responde com `Access-Control-Allow-Origin: null` e o navegador transforma isso em “Failed to send a request to the Edge Function”.

Plano
1. Corrigir `supabase/functions/_shared/cors.ts`
   - Padronizar `getCorsHeaders()` com a mesma política wildcard já usada em outras functions (`Access-Control-Allow-Origin: *`) e manter todos os headers `authorization`, `apikey`, `content-type` e `x-supabase-client-*`.
   - Se preferirmos manter allowlist, incluir também `*.lovableproject.com`; mas o wildcard é a correção mais robusta para preview + publicado.
2. Redeployar as functions que importam o helper compartilhado
   - Obrigatoriamente `reset-user-password`.
   - Idealmente todas que usam `../_shared/cors.ts`, para evitar comportamento inconsistente.
3. Validar no painel admin
   - Repetir o reset em `/admin/usuarios`.
   - Confirmar que o erro genérico de fetch desapareceu.
   - Se surgir um 401/403/400 com mensagem real, tratar a regra correspondente (admin/auth/validação de senha). Hoje o CORS está mascarando esse retorno.
4. Checagem final
   - Testar também no domínio publicado.
   - Se funcionar no publicado e falhar só no preview mesmo após o ajuste, classificar como limitação do proxy do preview e adicionar um fallback de mensagem no frontend.

Detalhes técnicos
```ts
export function getCorsHeaders(_req: Request) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  };
}
```

Sem migration de banco. O ajuste é só no helper de CORS + redeploy das functions dependentes.
