import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { equipe_id, trimestre, periodo } = await req.json();
    if (!equipe_id) return new Response(JSON.stringify({ error: "equipe_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const [equipeRes, metricasRes, entregasRes, diagRes] = await Promise.all([
      supabase.from("equipes_skills").select("*").eq("id", equipe_id).single(),
      supabase.from("metricas_skills").select("*").eq("equipe_id", equipe_id).order("semana", { ascending: false }).limit(12),
      supabase.from("entregas_skills").select("*").eq("equipe_id", equipe_id),
      supabase.from("diagnosticos_skills").select("economia_horas_semana, economia_valor_mensal, insight_ia").eq("equipe_id", equipe_id).eq("completado", true),
    ]);

    const contexto = {
      equipe: equipeRes.data?.nome || "Equipe",
      periodo: periodo || `T${trimestre || 1}`,
      metricas: metricasRes.data || [],
      entregas: { total: entregasRes.data?.length || 0, concluidas: entregasRes.data?.filter((e: any) => e.status === "concluida" || e.concluido_em).length || 0 },
      diagnosticos: diagRes.data?.length || 0,
      horas_economizadas: metricasRes.data?.reduce((a: number, m: any) => a + (m.horas_economizadas || 0), 0) || 0,
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Gere um report executivo trimestral HTML para um programa Skills B2B de automação e IA. Inclua KPIs, destaques, próximos passos. Retorne usando a função." },
          { role: "user", content: JSON.stringify(contexto) }
        ],
        tools: [{
          type: "function",
          function: {
            name: "gerar_report",
            description: "Gera report trimestral",
            parameters: {
              type: "object",
              properties: {
                titulo: { type: "string" },
                resumo_executivo: { type: "string" },
                conteudo_html: { type: "string" },
                metricas: { type: "object" }
              },
              required: ["titulo", "resumo_executivo", "conteudo_html"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "gerar_report" } }
      }),
    });

    if (!response.ok) throw new Error("Erro na IA");
    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou report");

    const dados = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ success: true, ...dados }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
