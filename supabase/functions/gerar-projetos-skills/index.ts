import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function mapPrioridade(prioridade: string): string {
  switch (prioridade) {
    case "alta": return "P1";
    case "media": return "P2";
    case "baixa": return "P3";
    default: return "P2";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { equipe_id } = await req.json();
    if (!equipe_id) return new Response(JSON.stringify({ error: "equipe_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: diagnosticos } = await supabase.from("diagnosticos_skills").select("*").eq("equipe_id", equipe_id).eq("completado", true);
    if (!diagnosticos?.length) return new Response(JSON.stringify({ error: "Nenhum diagnóstico preenchido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Fetch active members
    const { data: membros } = await supabase
      .from("membros_equipe_skills")
      .select("user_id")
      .eq("equipe_id", equipe_id)
      .eq("status", "ativo");

    const membrosIds = (membros || []).map((m: any) => m.user_id);

    const resumo = diagnosticos.map(d => ({
      processos: d.processos_detalhados || d.tarefas_manuais,
      gargalos: d.gargalos_identificados,
      economia: d.economia_horas_semana,
      area: d.area_atuacao,
    }));

    const systemPrompt = `Analise os diagnósticos de uma equipe e sugira projetos colaborativos de automação com IA. Retorne usando a função fornecida.

REGRAS:
1. Gere projetos relevantes baseados nos diagnósticos da equipe.
2. Cada projeto deve ter título, descrição, área impactada, economia estimada e prioridade.
3. NÃO inclua responsável. A atribuição será feita automaticamente pelo sistema.
4. Foque em projetos práticos e acionáveis de automação com IA.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(resumo) }
        ],
        tools: [{
          type: "function",
          function: {
            name: "sugerir_projetos",
            description: "Sugere projetos baseados nos diagnósticos.",
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
                      prioridade: { type: "string", enum: ["alta", "media", "baixa"] },
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

    // Round-robin assignment for projects
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
      responsavel_id: membrosIds.length > 0 ? membrosIds[i % membrosIds.length] : null,
      tags: [],
    }));

    const { data: insertedProjetos, error: insertError } = await supabase
      .from("backlog_skills")
      .insert(inserts)
      .select("id, titulo, descricao, prioridade, horas_estimadas_economia, responsavel_id, tags");
    if (insertError) throw new Error("Erro ao salvar projetos: " + insertError.message);

    // Create initial entregas for each project, also round-robin
    if (insertedProjetos?.length) {
      const entregasInserts = insertedProjetos.map((p: any, i: number) => ({
        equipe_id,
        backlog_item_id: p.id,
        titulo: p.titulo,
        descricao: p.descricao,
        status: "pendente",
        prioridade: mapPrioridade(p.prioridade || "media"),
        economia_horas_semana: p.horas_estimadas_economia || null,
        responsavel_id: membrosIds.length > 0 ? membrosIds[i % membrosIds.length] : null,
        tags: [],
      }));

      const { error: entregasError } = await supabase
        .from("entregas_skills")
        .insert(entregasInserts);
      
      if (entregasError) {
        console.error("Erro ao criar entregas automáticas:", entregasError.message);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      projetos_criados: inserts.length,
      entregas_criadas: insertedProjetos?.length || 0
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
