import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { equipe_id } = await req.json();
    if (!equipe_id) return new Response(JSON.stringify({ error: "equipe_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: diagnosticos } = await supabase.from("diagnosticos_skills").select("*").eq("equipe_id", equipe_id).eq("completado", true);
    if (!diagnosticos?.length) return new Response(JSON.stringify({ error: "Nenhum diagnóstico preenchido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const resumo = diagnosticos.map(d => ({
      processos: d.processos_detalhados || d.tarefas_manuais,
      gargalos: d.gargalos_identificados,
      economia: d.economia_horas_semana,
      area: d.area_atuacao,
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Analise os diagnósticos de uma equipe e sugira projetos colaborativos de automação com IA. Retorne usando a função fornecida." },
          { role: "user", content: JSON.stringify(resumo) }
        ],
        tools: [{
          type: "function",
          function: {
            name: "sugerir_projetos",
            description: "Sugere projetos baseados nos diagnósticos",
            parameters: {
              type: "object",
              properties: {
                projetos: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      titulo: { type: "string" },
                      descricao: { type: "string" },
                      area_impactada: { type: "string" },
                      horas_estimadas_economia: { type: "number" },
                      prioridade: { type: "string", enum: ["alta", "media", "baixa"] }
                    },
                    required: ["titulo", "descricao", "prioridade"]
                  }
                }
              },
              required: ["projetos"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "sugerir_projetos" } }
      }),
    });

    if (!response.ok) throw new Error("Erro na IA");
    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou projetos");

    const { projetos } = JSON.parse(toolCall.function.arguments);

    const inserts = projetos.map((p: any, i: number) => ({
      equipe_id,
      titulo: p.titulo,
      descricao: p.descricao,
      area_impactada: p.area_impactada || null,
      horas_estimadas_economia: p.horas_estimadas_economia || null,
      prioridade: p.prioridade,
      status: "levantado",
      origem: "ia",
      ordem: i,
    }));

    const { error: insertError } = await supabase.from("backlog_skills").insert(inserts);
    if (insertError) throw new Error("Erro ao salvar projetos: " + insertError.message);

    return new Response(JSON.stringify({ success: true, projetos_criados: inserts.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
