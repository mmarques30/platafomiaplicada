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
    if (!equipe_id) {
      return new Response(JSON.stringify({ error: "equipe_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1. Buscar membros
    const { data: membros, error: membrosError } = await supabase
      .from("membros_equipe_skills")
      .select("user_id, papel")
      .eq("equipe_id", equipe_id)
      .eq("status", "ativo");

    if (!membros?.length) {
      return new Response(JSON.stringify({ error: "Nenhum membro ativo na equipe" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profiles for members
    const userIds = membros.map((m: any) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nome_completo, cargo")
      .in("id", userIds);

    const { data: diagnosticos } = await supabase
      .from("diagnosticos_skills")
      .select("user_id, area_atuacao, processos_detalhados, tarefas_manuais, gargalos_identificados, cargo")
      .eq("equipe_id", equipe_id)
      .eq("completado", true);

    // Build member profiles with diagnostics
    const membrosInfo = membros.map((m: any) => {
      const profile = profiles?.find((p: any) => p.id === m.user_id);
      const diag = diagnosticos?.find((d: any) => d.user_id === m.user_id);
      return {
        user_id: m.user_id,
        nome: profile?.nome_completo || "Membro",
        cargo: profile?.cargo || m.papel || "Colaborador",
        area: diag?.area_atuacao || "",
        processos: diag?.processos_detalhados || diag?.tarefas_manuais || [],
        gargalos: diag?.gargalos_identificados || [],
      };
    });

    // 2. Buscar projetos e entregas sem responsável
    const { data: projetos } = await supabase
      .from("backlog_skills")
      .select("id, titulo, descricao, area_impactada")
      .eq("equipe_id", equipe_id)
      .is("responsavel_id", null);

    const { data: entregas } = await supabase
      .from("entregas_skills")
      .select("id, titulo, descricao")
      .eq("equipe_id", equipe_id)
      .is("responsavel_id", null);

    const totalItens = (projetos?.length || 0) + (entregas?.length || 0);
    if (totalItens === 0) {
      return new Response(JSON.stringify({ success: true, message: "Nenhum item sem responsável", associados: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Montar itens para IA
    const itens = [
      ...(projetos || []).map((p: any) => ({
        item_id: p.id, item_tipo: "projeto", titulo: p.titulo, descricao: p.descricao || "", area: p.area_impactada || "",
      })),
      ...(entregas || []).map((e: any) => ({
        item_id: e.id, item_tipo: "entrega", titulo: e.titulo, descricao: e.descricao || "",
      })),
    ];

    const membrosTexto = membrosInfo.map((m: any) =>
      `- ${m.nome} (${m.cargo}, Área: ${m.area})\n  Processos: ${JSON.stringify(m.processos)}\n  Gargalos: ${JSON.stringify(m.gargalos)}`
    ).join("\n");

    const itensTexto = itens.map((i: any) =>
      `- [${i.item_tipo}] ID: ${i.item_id} | "${i.titulo}" | ${i.descricao}`
    ).join("\n");

    const systemPrompt = `Você é um consultor de transformação digital. Associe cada projeto/entrega ao membro mais relevante da equipe, com base nos diagnósticos individuais (área, processos, gargalos).

MEMBROS DA EQUIPE:
${membrosTexto}

ITENS PARA ASSOCIAR:
${itensTexto}

Regras:
- Cada item deve ser associado a exatamente 1 membro
- Use o nome EXATO do membro no campo responsavel_nome
- Distribua os itens de forma equilibrada quando possível
- Priorize a relevância (área, processos similares) sobre equilíbrio`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Associe cada item ao membro mais adequado." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "associar_membros",
            description: "Associa itens aos membros da equipe",
            parameters: {
              type: "object",
              properties: {
                associacoes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item_id: { type: "string" },
                      item_tipo: { type: "string", enum: ["projeto", "entrega"] },
                      responsavel_nome: { type: "string" },
                    },
                    required: ["item_id", "item_tipo", "responsavel_nome"],
                  },
                },
              },
              required: ["associacoes"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "associar_membros" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou associações");

    const { associacoes } = JSON.parse(toolCall.function.arguments);

    // 4. Mapear nomes para user_ids
    const nomeToId: Record<string, string> = {};
    for (const m of membrosInfo) {
      nomeToId[m.nome.toLowerCase().trim()] = m.user_id;
    }

    let atualizados = 0;
    for (const assoc of associacoes) {
      const matchKey = Object.keys(nomeToId).find(
        (k) => assoc.responsavel_nome?.toLowerCase().trim().includes(k) || k.includes(assoc.responsavel_nome?.toLowerCase().trim())
      );
      const userId = matchKey ? nomeToId[matchKey] : null;
      if (!userId) {
        console.warn(`Membro não encontrado: ${assoc.responsavel_nome}`);
        continue;
      }

      const table = assoc.item_tipo === "projeto" ? "backlog_skills" : "entregas_skills";
      const { error } = await supabase
        .from(table)
        .update({ responsavel_id: userId })
        .eq("id", assoc.item_id);

      if (error) {
        console.error(`Erro ao atualizar ${assoc.item_id}:`, error.message);
      } else {
        atualizados++;
      }
    }

    return new Response(JSON.stringify({ success: true, associados: atualizados, total: associacoes.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
