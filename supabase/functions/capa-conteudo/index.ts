import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * capa-conteudo
 *
 * Descobre a imagem de capa de um conteúdo a partir do link da notícia
 * (og:image / twitter:image da página) e grava em conteudos_dashboard.
 *
 * Body:
 *   { url: string }        -> devolve { image } sem gravar (uso no admin)
 *   { ids: string[] }      -> para cada conteúdo sem imagem_url e com
 *                             link_externo, busca a capa e grava; devolve
 *                             { capas: { [id]: url | null } }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const UA =
  "Mozilla/5.0 (compatible; IAplicadaBot/1.0; +https://iaplicada.com) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

function extrairMeta(html: string, base: string): string | null {
  const head = html.slice(0, 300_000);
  const padroes = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
    /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
  ];
  for (const re of padroes) {
    const m = head.match(re);
    if (m?.[1]) {
      try {
        const abs = new URL(m[1].replace(/&amp;/g, "&"), base).toString();
        if (/\.(ico|svg)(\?|$)/i.test(abs)) continue;
        return abs;
      } catch {
        continue;
      }
    }
  }
  return null;
}

async function buscarCapa(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const tipo = res.headers.get("content-type") || "";
    if (!tipo.includes("html")) return null;
    const html = await res.text();
    return extrairMeta(html, res.url || url);
  } catch (e) {
    console.warn("capa-conteudo: falha ao buscar", url, String(e));
    return null;
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Não autorizado" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: "Usuário não autenticado" }, 401);

    const body = await req.json().catch(() => ({}));

    // Modo 1: só descobrir a imagem de uma URL (admin)
    if (typeof body.url === "string" && body.url) {
      let alvo: URL;
      try {
        alvo = new URL(body.url);
      } catch {
        return json({ error: "URL inválida" }, 400);
      }
      if (!/^https?:$/.test(alvo.protocol)) return json({ error: "URL inválida" }, 400);
      const image = await buscarCapa(alvo.toString());
      return json({ image });
    }

    // Modo 2: preencher capas de conteúdos sem imagem
    const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 10) : [];
    if (ids.length === 0) return json({ error: "Informe url ou ids" }, 400);

    const { data: conteudos, error } = await admin
      .from("conteudos_dashboard")
      .select("id, link_externo, imagem_url")
      .in("id", ids)
      .is("imagem_url", null)
      .not("link_externo", "is", null);
    if (error) return json({ error: error.message }, 500);

    const capas: Record<string, string | null> = {};
    await Promise.all(
      (conteudos || []).map(async (c) => {
        let alvo: string | null = null;
        try {
          const u = new URL(c.link_externo as string);
          if (/^https?:$/.test(u.protocol)) alvo = u.toString();
        } catch {
          alvo = null;
        }
        const image = alvo ? await buscarCapa(alvo) : null;
        capas[c.id] = image;
        if (image) {
          await admin.from("conteudos_dashboard").update({ imagem_url: image }).eq("id", c.id);
        }
      })
    );

    return json({ capas });
  } catch (e) {
    console.error("capa-conteudo:", e);
    return json({ error: String(e) }, 500);
  }
});
