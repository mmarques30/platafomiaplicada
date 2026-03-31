import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions";

const JSON_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "curadoria_items",
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              titulo: { type: "string" },
              resumo: { type: "string" },
              conteudo: { type: "string" },
              link_externo: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              autor: { type: "string" },
            },
            required: ["titulo", "resumo", "conteudo", "tags", "autor"],
          },
        },
      },
      required: ["items"],
    },
  },
};

const PROMPTS: Record<string, string> = {
  noticia: `Gerar um relatório semanal conciso, em português, sobre negócios, tecnologia e inteligência artificial, contendo:

Panorama da semana em IA e negócios — Principais notícias dos últimos 7 dias sobre:
- Startups e novos modelos de negócio baseados em IA
- Pessoas-destaque (fundadores, executivos, investidores)
- Fusões, aquisições e grandes rodadas de funding ligadas à IA
- Mudanças de mercado que impactem trabalho, produtividade, liderança e cultura organizacional
- Novas ferramentas de IA lançadas (ou grandes updates) e seus possíveis impactos globais

Priorizar ângulos culturais, comportamentais e de liderança. Evitar fofoca rasa ou conteúdo sensacionalista.
Usar apenas fontes confiáveis, atualizadas na última semana. Citar explicitamente as fontes ao final de cada notícia.
Retornar entre 5 e 8 notícias. Para cada uma: titulo, resumo (2-3 frases), conteudo (texto corrido detalhado), tags relevantes, autor (veículo/fonte + data).`,

  dica: `Gerar dicas práticas e hacks de uso de IA derivados dos lançamentos e notícias da última semana, em português.

Focar em:
- Como um time poderia aplicar essa ferramenta no dia a dia
- Que tipo de workflow pode ser melhorado
- Aplicações voltadas a profissionais do conhecimento, gestores, empreendedores e criadores de conteúdo

Usar apenas fontes confiáveis, atualizadas na última semana. Citar fontes.
Retornar entre 4 e 6 dicas. Para cada uma: titulo, resumo (1-2 frases), conteudo (texto com passo-a-passo ou explicação prática), tags relevantes, autor (fonte).`,

  newsletter: `Selecionar as 5 notícias ou cases da última semana com maior potencial para roteiros de conteúdo (vídeo, newsletter, carrossel) no nicho de IA, produtividade e liderança. Em português.

Para cada história, explicar:
- Qual é o conflito ou tensão central (ex.: líder x equipe, promessa da IA x realidade, impacto social ou ético)
- Por que funciona bem como narrativa (gancho, personagem, contexto cultural ou de trabalho)
- Sugestão de 1-2 ângulos possíveis de abordagem para creators (ex.: "lição de liderança", "hack de produtividade", "alerta de tendência")

Priorizar ângulos culturais, comportamentais e de liderança. Evitar fofoca rasa ou conteúdo sensacionalista.
Usar apenas fontes confiáveis. Citar fontes.
Retornar exatamente 5 histórias. Para cada uma: titulo, resumo (2-3 frases), conteudo (análise narrativa completa), tags, autor (fonte).`,
};

async function callPerplexity(apiKey: string, tipo: string): Promise<any[]> {
  const response = await fetch(PERPLEXITY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: "Você é um curador de conteúdo especializado em IA, negócios e liderança. Retorne APENAS o JSON estruturado solicitado." },
        { role: "user", content: PROMPTS[tipo] },
      ],
      search_recency_filter: "week",
      response_format: JSON_SCHEMA,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Perplexity error for ${tipo}:`, response.status, text);
    throw new Error(`Perplexity API error [${response.status}]: ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`No content returned for ${tipo}`);

  const parsed = typeof content === "string" ? JSON.parse(content) : content;
  return (parsed.items || []).map((item: any) => ({
    ...item,
    link_externo: item.link_externo || null,
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      return new Response(JSON.stringify({ error: "PERPLEXITY_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tipos } = await req.json();
    const tiposToGenerate: string[] = tipos || ["noticia", "dica", "newsletter"];

    // Call Perplexity in parallel
    const results = await Promise.allSettled(
      tiposToGenerate.map(async (tipo) => ({
        tipo,
        items: await callPerplexity(PERPLEXITY_API_KEY, tipo),
      }))
    );

    const curadoria: Record<string, any[]> = {};
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        curadoria[result.value.tipo] = result.value.items;
      } else {
        console.error("Perplexity call failed:", result.reason);
        errors.push(String(result.reason));
      }
    }

    return new Response(JSON.stringify({ curadoria, errors }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("gerar-curadoria-semanal error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
