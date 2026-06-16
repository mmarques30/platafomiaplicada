// O cliente supabase-js retorna `FunctionsHttpError` com a mensagem
// genérica "Edge Function returned a non-2xx status code" sempre que a
// edge function responde 4xx/5xx. A mensagem real está no body da
// resposta (acessível em `error.context`, que é o Response original).
//
// Esta função lê o body e devolve a mensagem mais útil — `error` /
// `message` do JSON, ou texto cru se não for JSON. Fallback final é
// a mensagem genérica.
export async function extractEdgeFunctionError(error: unknown): Promise<string> {
  if (!error) return "Erro desconhecido";

  const anyErr = error as any;
  const ctx: Response | undefined = anyErr?.context;

  if (ctx && typeof ctx.clone === "function") {
    try {
      const text = await ctx.clone().text();
      try {
        const json = JSON.parse(text);
        return json?.error ?? json?.message ?? text ?? anyErr.message;
      } catch {
        return text || anyErr.message || "Erro desconhecido";
      }
    } catch {
      // fall through
    }
  }

  return anyErr?.message ?? String(error);
}
