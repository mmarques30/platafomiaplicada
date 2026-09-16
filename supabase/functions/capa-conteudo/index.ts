import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * capa-conteudo
 *
 * Descobre a imagem de capa de um conteúdo a partir do link da notícia e
 * guarda uma cópia no bucket público `conteudos-dashboard` (pasta `capas/`),
 * para o card não depender de hotlink bloqueado pelo site de origem.
 *
 * Ordem de tentativa:
 *   1. og:image / twitter:image / itemprop=image / JSON-LD da página
 *   2. captura da página (mShots) quando o site não expõe imagem
 *
 * Body:
 *   { url: string }        -> devolve { image } (já hospedada) sem gravar
 *   { ids: string[] }      -> para cada conteúdo com link_externo cuja capa
 *                             está vazia ou fora do nosso storage, busca,
 *                             hospeda e grava; devolve { capas: { [id]: url | null } }
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

const BUCKET = "conteudos-dashboard";
const PASTA = "capas";
const TAMANHO_MAX = 6 * 1024 * 1024; // 6 MB
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const EXT_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

type Imagem = { bytes: Uint8Array; tipo: string };

function comTimeout(ms: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(timer) };
}

function normalizarUrl(bruta: string | null | undefined): string | null {
  if (!bruta) return null;
  try {
    const u = new URL(bruta.trim());
    return /^https?:$/.test(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Procura a imagem principal nos metadados da página. */
function extrairMeta(html: string, base: string): string | null {
  const head = html.slice(0, 400_000);
  const padroes = [
    /<meta[^>]+property=["']og:image(?::secure_url|:url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url|:url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
    /<meta[^>]+itemprop=["']image["'][^>]*content=["']([^"']+)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
    // JSON-LD: "image": "https://..."  |  "image": { "url": "https://..." }  |  "image": ["https://..."]
    /"image"\s*:\s*(?:\[\s*)?(?:\{[^}]*?"url"\s*:\s*)?"(https?:\/\/[^"]+)"/i,
  ];
  for (const re of padroes) {
    const m = head.match(re);
    if (!m?.[1]) continue;
    try {
      const abs = new URL(m[1].replace(/&amp;/g, "&").replace(/\\\//g, "/"), base).toString();
      if (/\.(ico|svg)(\?|$)/i.test(abs)) continue;
      return abs;
    } catch {
      continue;
    }
  }
  return null;
}

async function descobrirImagemDaPagina(url: string): Promise<string | null> {
  const t = comTimeout(8000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: t.signal,
    });
    if (!res.ok) return null;
    const tipo = res.headers.get("content-type") || "";
    if (!tipo.includes("html")) return null;
    const html = await res.text();
    return extrairMeta(html, res.url || url);
  } catch (e) {
    console.warn("capa-conteudo: página inacessível", url, String(e));
    return null;
  } finally {
    t.done();
  }
}

/** Baixa a imagem (com Referer da página, que muitos CDNs exigem). */
async function baixarImagem(imgUrl: string, referer: string): Promise<Imagem | null> {
  const t = comTimeout(10000);
  try {
    const res = await fetch(imgUrl, {
      headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/*,*/*;q=0.8", Referer: referer },
      redirect: "follow",
      signal: t.signal,
    });
    if (!res.ok) return null;
    const tipo = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!EXT_POR_TIPO[tipo]) return null;
    const tamanho = Number(res.headers.get("content-length") || 0);
    if (tamanho > TAMANHO_MAX) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength < 1024 || bytes.byteLength > TAMANHO_MAX) return null;
    return { bytes, tipo };
  } catch (e) {
    console.warn("capa-conteudo: imagem inacessível", imgUrl, String(e));
    return null;
  } finally {
    t.done();
  }
}

/**
 * Captura da página pelo mShots (WordPress.com). Enquanto a captura está
 * sendo gerada o serviço responde com redirecionamento para um placeholder,
 * então esperamos e tentamos de novo algumas vezes.
 */
async function capturarPagina(url: string): Promise<Imagem | null> {
  const alvo = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=675`;
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const t = comTimeout(10000);
    try {
      const res = await fetch(alvo, { headers: { "User-Agent": UA }, redirect: "manual", signal: t.signal });
      if (res.status === 200) {
        const tipo = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
        const bytes = new Uint8Array(await res.arrayBuffer());
        if (EXT_POR_TIPO[tipo] && bytes.byteLength > 4096 && bytes.byteLength <= TAMANHO_MAX) {
          return { bytes, tipo };
        }
        return null;
      }
      // 3xx = ainda gerando
      if (res.status < 300 || res.status >= 400) return null;
    } catch (e) {
      console.warn("capa-conteudo: captura falhou", url, String(e));
      return null;
    } finally {
      t.done();
    }
    await new Promise((r) => setTimeout(r, 3500));
  }
  return null;
}

// deno-lint-ignore no-explicit-any
async function hospedar(admin: any, chave: string, img: Imagem): Promise<string | null> {
  const caminho = `${PASTA}/${chave}.${EXT_POR_TIPO[img.tipo]}`;
  const { error } = await admin.storage.from(BUCKET).upload(caminho, img.bytes, {
    contentType: img.tipo,
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) {
    console.error("capa-conteudo: upload falhou", caminho, error.message);
    return null;
  }
  const { data } = admin.storage.from(BUCKET).getPublicUrl(caminho);
  return data?.publicUrl ?? null;
}

/** Fluxo completo: descobrir -> baixar (ou capturar) -> hospedar. */
// deno-lint-ignore no-explicit-any
async function obterCapaHospedada(admin: any, chave: string, paginaUrl: string): Promise<string | null> {
  let img: Imagem | null = null;

  const imgUrl = await descobrirImagemDaPagina(paginaUrl);
  if (imgUrl) img = await baixarImagem(imgUrl, paginaUrl);
  if (!img) img = await capturarPagina(paginaUrl);
  if (!img) return null;

  return hospedar(admin, chave, img);
}

function ehHospedada(url: string | null | undefined): boolean {
  return !!url && url.includes(`/storage/v1/object/public/${BUCKET}/`);
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

    // Modo 1: descobrir e hospedar a imagem de uma URL (botão do admin)
    if (typeof body.url === "string" && body.url) {
      const alvo = normalizarUrl(body.url);
      if (!alvo) return json({ error: "URL inválida" }, 400);
      const chave = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const image = await obterCapaHospedada(admin, chave, alvo);
      return json({ image });
    }

    // Modo 2: preencher capas dos conteúdos informados
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 10)
      : [];
    if (ids.length === 0) return json({ error: "Informe url ou ids" }, 400);

    const { data: conteudos, error } = await admin
      .from("conteudos_dashboard")
      .select("id, link_externo, imagem_url")
      .in("id", ids)
      .not("link_externo", "is", null);
    if (error) return json({ error: error.message }, 500);

    const capas: Record<string, string | null> = {};
    await Promise.all(
      (conteudos || []).map(async (c: { id: string; link_externo: string | null; imagem_url: string | null }) => {
        // Já temos cópia nossa: nada a fazer
        if (ehHospedada(c.imagem_url)) {
          capas[c.id] = c.imagem_url;
          return;
        }

        const pagina = normalizarUrl(c.link_externo);
        let url: string | null = null;

        // Imagem externa cadastrada à mão: tenta só copiá-la para o storage
        const externa = normalizarUrl(c.imagem_url);
        if (externa) {
          const img = await baixarImagem(externa, pagina ?? externa);
          if (img) url = await hospedar(admin, c.id, img);
        }
        if (!url && pagina) url = await obterCapaHospedada(admin, c.id, pagina);

        capas[c.id] = url;
        if (url && url !== c.imagem_url) {
          await admin.from("conteudos_dashboard").update({ imagem_url: url }).eq("id", c.id);
        }
      })
    );

    return json({ capas });
  } catch (e) {
    console.error("capa-conteudo:", e);
    return json({ error: String(e) }, 500);
  }
});
