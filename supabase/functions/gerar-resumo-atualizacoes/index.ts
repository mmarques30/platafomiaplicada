import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Verify admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { periodo } = await req.json();
    const dias = periodo === "30d" ? 30 : 7;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    // Query audit records
    const { data: registros, error: queryError } = await supabase
      .from("auditoria_conteudo")
      .select("tabela, operacao, dados_novos, dados_anteriores, campos_alterados, created_at")
      .gte("created_at", dataLimite.toISOString())
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Query error:", queryError);
      return new Response(JSON.stringify({ error: "Erro ao buscar dados" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!registros || registros.length === 0) {
      return new Response(
        JSON.stringify({ resumo: `Nenhuma alteração encontrada nos últimos ${dias} dias.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract titles and build alterations list
    const alteracoes = registros.map((r: any) => {
      const dados = r.dados_novos || r.dados_anteriores || {};
      const titulo = dados.titulo || dados.nome || dados.tema || dados.name || "(sem título)";
      const entry: any = {
        tabela: r.tabela,
        operacao: r.operacao,
        titulo,
        data: new Date(r.created_at).toLocaleDateString("pt-BR"),
      };
      if (r.operacao === "UPDATE" && r.campos_alterados?.length) {
        entry.campos = r.campos_alterados;
      }
      return entry;
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um assistente que gera resumos de atualizações de plataforma educacional.
Receberá uma lista de alterações recentes organizadas por tipo.
Gere um resumo claro e organizado, em português, pronto para ser compartilhado em grupos do WhatsApp/Telegram.

Use emojis para cada categoria. Formato:
- Título com período
- Seções por tipo (Vídeos, Módulos, Trilhas, Materiais, etc.)
- Para cada seção, liste os itens adicionados ou alterados com seus títulos
- Finalize com um breve destaque motivacional

NÃO invente dados. Use apenas as informações fornecidas.
Se houver muitas atualizações de um mesmo tipo, agrupe de forma concisa.`;

    const userPrompt = JSON.stringify({ periodo: `${dias} dias`, alteracoes });

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "Erro ao gerar resumo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const resumo = aiData.choices?.[0]?.message?.content || "Não foi possível gerar o resumo.";

    return new Response(JSON.stringify({ resumo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
