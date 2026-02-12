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

    // Buscar membros para associação
    const { data: membros } = await supabase
      .from("membros_equipe_skills")
      .select("user_id, papel, profiles(nome_completo, cargo)")
      .eq("equipe_id", equipe_id)
      .eq("status", "ativo");

    const membrosInfo = (membros || []).map((m: any) => {
      const diag = diagnosticos.find((d: any) => d.user_id === m.user_id);
      return {
        user_id: m.user_id,
        nome: (m.profiles as any)?.nome_completo || "Membro",
        cargo: (m.profiles as any)?.cargo || m.papel || "Colaborador",
        area: diag?.area_atuacao || "",
        processos: diag?.processos_detalhados || diag?.tarefas_manuais || [],
        gargalos: diag?.gargalos_identificados || [],
      };
    });

    const resumo = diagnosticos.map(d => ({
      processos: d.processos_detalhados || d.tarefas_manuais,
      gargalos: d.gargalos_identificados,
      economia: d.economia_horas_semana,
      area: d.area_atuacao,
    }));

    const membrosTexto = membrosInfo.map((m: any) =>
      `- ${m.nome} (${m.cargo}, Área: ${m.area}) | Processos: ${JSON.stringify(m.processos)}`
    ).join("\n");

    const systemPrompt = `Analise os diagnósticos de uma equipe e sugira projetos colaborativos de automação com IA. Retorne usando a função fornecida.

MEMBROS DA EQUIPE:
${membrosTexto}

Para cada projeto, atribua um responsavel_nome (nome EXATO de um dos membros acima) com base na relevância do projeto para a área e processos do membro.`;

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
                      prioridade: { type: "string", enum: ["alta", "media", "baixa"] },
                      responsavel_nome: { type: "string" },
                    },
                    required: ["titulo", "descricao", "prioridade", "responsavel_nome"]
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

    // Mapear nomes para user_ids
    const nomeToId: Record<string, string> = {};
    for (const m of membrosInfo) {
      nomeToId[m.nome.toLowerCase().trim()] = m.user_id;
    }

    const findUserId = (nome: string): string | null => {
      if (!nome) return null;
      const key = Object.keys(nomeToId).find(
        (k) => nome.toLowerCase().trim().includes(k) || k.includes(nome.toLowerCase().trim())
      );
      return key ? nomeToId[key] : null;
    };

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
      responsavel_id: findUserId(p.responsavel_nome),
    }));

    const { data: insertedProjetos, error: insertError } = await supabase
      .from("backlog_skills")
      .insert(inserts)
      .select("id, titulo, descricao, prioridade, horas_estimadas_economia, responsavel_id");
    if (insertError) throw new Error("Erro ao salvar projetos: " + insertError.message);

    // Criar entregas automaticamente para cada projeto gerado
    if (insertedProjetos?.length) {
      const entregasInserts = insertedProjetos.map((p: any) => ({
        equipe_id,
        backlog_item_id: p.id,
        titulo: p.titulo,
        descricao: p.descricao,
        status: "pendente",
        prioridade: mapPrioridade(p.prioridade || "media"),
        economia_horas_semana: p.horas_estimadas_economia || null,
        responsavel_id: p.responsavel_id || null,
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
