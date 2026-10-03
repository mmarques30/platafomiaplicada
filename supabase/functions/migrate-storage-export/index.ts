import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEW_PROJECT_URL = "https://ulfxwhtztgxmcrsaceke.supabase.co";
const NEW_SERVICE_ROLE_KEY = Deno.env.get("TARGET_SERVICE_ROLE_KEY")!;

const ALL_BUCKETS = [
  "knowledge-documents", "trilhas-imagens", "video-thumbnails", "exercicios-respostas",
  "diagnosticos-mentoria", "transcricoes-mentoria", "entregas-mentoria", "video-materiais",
  "ferramentas-logos", "modulos-imagens", "avatars", "community-posts-images",
  "bonus-mentoria", "ia-copie-use", "materiais-gratuitos", "conteudos-dashboard",
  "instrucoes-recursos", "materiais-comunidade", "contratos-business", "documentos-skills",
  "entregas-equipe-skills",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!Deno.env.get("TARGET_SERVICE_ROLE_KEY")) {
    return new Response(
      JSON.stringify({ error: "TARGET_SERVICE_ROLE_KEY secret not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let bucketsToRun = ALL_BUCKETS;
  try {
    const body = await req.json();
    if (Array.isArray(body?.buckets) && body.buckets.length > 0) {
      bucketsToRun = body.buckets;
    }
  } catch {
    // no body / not JSON, use all buckets
  }

  async function listAllPaths(bucket: string, prefix = ""): Promise<string[]> {
    const paths: string[] = [];
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
    if (error) {
      console.error(`list error ${bucket}/${prefix}:`, error.message);
      return paths;
    }
    for (const item of data ?? []) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        const nested = await listAllPaths(bucket, fullPath);
        paths.push(...nested);
      } else {
        paths.push(fullPath);
      }
    }
    return paths;
  }

  const results: Record<string, { found: number; uploaded: number; failed: { path: string; error: string }[] }> = {};

  for (const bucket of bucketsToRun) {
    const paths = await listAllPaths(bucket);
    const failed: { path: string; error: string }[] = [];
    let uploaded = 0;

    for (const path of paths) {
      try {
        const { data: fileBlob, error: downloadError } = await supabase.storage.from(bucket).download(path);
        if (downloadError || !fileBlob) {
          failed.push({ path, error: downloadError?.message ?? "download returned no data" });
          continue;
        }
        const arrayBuffer = await fileBlob.arrayBuffer();
        const contentType = fileBlob.type || "application/octet-stream";

        const uploadResp = await fetch(
          `${NEW_PROJECT_URL}/storage/v1/object/${bucket}/${path}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${NEW_SERVICE_ROLE_KEY}`,
              apikey: NEW_SERVICE_ROLE_KEY,
              "Content-Type": contentType,
              "x-upsert": "true",
            },
            body: arrayBuffer,
          },
        );

        if (uploadResp.ok) {
          uploaded++;
        } else {
          const text = await uploadResp.text();
          failed.push({ path, error: `upload ${uploadResp.status}: ${text.slice(0, 200)}` });
        }
      } catch (e) {
        failed.push({ path, error: e instanceof Error ? e.message : String(e) });
      }
    }

    results[bucket] = { found: paths.length, uploaded, failed };
    console.log(`[${bucket}] found=${paths.length} uploaded=${uploaded} failed=${failed.length}`);
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

Requisitos importantes:
1. Essa função usa `Deno.env.get("SUPABASE_URL")` e `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` — essas já existem automaticamente no ambiente, não precisa criar.
