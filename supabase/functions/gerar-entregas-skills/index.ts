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

    // Fetch backlog projects
    const { data: projetos, error: projError } = await supabase
      .from("backlog_skills")
      .select("id, titulo, descricao, area_impactada, prioridade, horas_estimadas_economia, status")
      .eq("equipe_id", equipe_id);

    if (projError) throw projError;
    if (!projetos?.length) {
      return new Response(JSON.stringify({ error: "Nenhum projeto encontrado no backlog" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch active team members
    const { data: membros } = await supabase
      .from("membros_equipe_skills")
      .select("user_id")
      .eq("equipe_id", equipe_id)
      .eq("status", "ativo");

    const membrosIds = (membros || []).map((m: any) => m.user_id);

    const projetosTexto = projetos.map((p: any) =>
      `- "${p.titulo}" | ${p.descricao || "sem descrição"} | Área: ${p.area_impactada || "geral"} | Prioridade: ${p.prioridade || "média"} | Economia estimada: ${p.horas_estimadas_economia || 0}h/semana`
    ).join("\n");

    const systemPrompt = `Você é um consultor especialista em transformação digital e implementação de IA em equipes corporativas.

REGRA CRÍTICA: Entregas NÃO são projetos. Entregas são ETAPAS, TAREFAS e ATIVIDADES práticas e específicas que a equipe precisa executar para que o PROJETO seja concluído com sucesso.

PROIBIDO: O título da entrega NUNCA pode ser igual ou muito similar ao título do projeto.

EXEMPLO CORRETO:
  Projeto: "Automação de Análise e Geração de Gráficos para DFC"
  Entregas:
    1. "Mapear fontes de dados e KPIs da DFC atual" 
    2. "Criar template de prompts para análise automática de desvios"
    3. "Desenvolver script de geração automática de gráficos contextuais"

PROJETOS DA EQUIPE:
${projetosTexto}

Para cada projeto, gere de 2 a 4 entregas que sejam PASSOS CONCRETOS de execução. Cada entrega deve ter:
- titulo: nome claro, específico e DIFERENTE do título do projeto
- descricao: o que precisa ser feito (2-3 frases)
- instrucoes: passo a passo detalhado para executar
- tipo: "individual", "colaborativo" ou "sistema"
- prioridade: "P1" (urgente), "P2" (importante) ou "P3" (desejável)
- economia_horas_semana: estimativa de horas economizadas por semana
- prazo_dias: prazo sugerido em dias
- projeto_titulo: título exato do projeto de origem

NÃO inclua responsável. A atribuição será feita automaticamente pelo sistema.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Gere as entregas práticas para todos os projetos listados." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "registrar_entregas",
            description: "Registra as entregas geradas para os projetos da equipe",
            parameters: {
              type: "object",
              properties: {
                entregas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      projeto_titulo: { type: "string" },
                      titulo: { type: "string" },
                      descricao: { type: "string" },
                      instrucoes: { type: "string" },
                      tipo: { type: "string", enum: ["individual", "colaborativo", "sistema"] },
                      prioridade: { type: "string", enum: ["P1", "P2", "P3"] },
                      economia_horas_semana: { type: "number" },
                      prazo_dias: { type: "number" },
                    },
                    required: ["projeto_titulo", "titulo", "descricao", "instrucoes", "tipo", "prioridade", "economia_horas_semana", "prazo_dias"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["entregas"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "registrar_entregas" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou entregas estruturadas");

    const { entregas } = JSON.parse(toolCall.function.arguments);
    if (!entregas?.length) throw new Error("IA não gerou nenhuma entrega");

    // Map projeto_titulo to backlog item id
    const projetoMap: Record<string, string> = {};
    for (const p of projetos) {
      projetoMap[p.titulo.toLowerCase().trim()] = p.id;
    }

    const now = new Date();
    const entregasToInsert = entregas.map((e: any, index: number) => {
      const matchKey = Object.keys(projetoMap).find(
        (k) => e.projeto_titulo?.toLowerCase().trim().includes(k) || k.includes(e.projeto_titulo?.toLowerCase().trim())
      );
      const backlogItemId = matchKey ? projetoMap[matchKey] : null;
      const prazoDate = new Date(now);
      prazoDate.setDate(prazoDate.getDate() + (e.prazo_dias || 14));

      return {
        equipe_id,
        backlog_item_id: backlogItemId,
        titulo: e.titulo,
        descricao: e.descricao,
        instrucoes: e.instrucoes,
        tipo: e.tipo,
        prioridade: e.prioridade,
        economia_horas_semana: e.economia_horas_semana || 0,
        prazo: prazoDate.toISOString().split("T")[0],
        status: "pendente",
        // Round-robin: assign deterministically across all members
        responsavel_id: membrosIds.length > 0 ? membrosIds[index % membrosIds.length] : null,
      };
    });

    const { error: insertError } = await supabase.from("entregas_skills").insert(entregasToInsert);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, total: entregasToInsert.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
