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

    // Fetch all completed diagnostics with insights
    const { data: diagnosticos, error: diagError } = await supabase
      .from("diagnosticos_skills")
      .select("*, profiles:user_id(nome_completo)")
      .eq("equipe_id", equipe_id)
      .eq("completado", true);

    if (diagError) throw diagError;
    if (!diagnosticos?.length) {
      return new Response(JSON.stringify({ error: "Nenhum diagnóstico completo encontrado para consolidar" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resumoDiagnosticos = diagnosticos.map(d => ({
      membro: (d as any).profiles?.nome_completo || "Membro",
      cargo: d.cargo || (d as any).profiles?.cargo,
      area: d.area_atuacao,
      processos_detalhados: d.processos_detalhados,
      tarefas_manuais: d.tarefas_manuais,
      gargalos: d.gargalos_identificados,
      ferramentas_atuais: d.ferramentas_atuais,
      economia_horas: d.economia_horas_semana,
      economia_valor: d.economia_valor_mensal,
      insight_ia: d.insight_ia,
      processos_repetitivos: d.processos_repetitivos,
      onde_perde_mais_tempo: d.onde_perde_mais_tempo,
      barreiras: d.barreiras,
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um consultor de transformação digital. Analise os diagnósticos individuais de uma equipe e gere um diagnóstico consolidado.
Identifique padrões comuns, sobreposições de esforço, e oportunidades de projetos colaborativos.
Retorne usando a função fornecida. Seja específico e prático nas recomendações.`
          },
          { role: "user", content: `Diagnósticos de ${diagnosticos.length} membros da equipe:\n${JSON.stringify(resumoDiagnosticos, null, 2)}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "consolidar_diagnostico",
            description: "Consolida diagnósticos individuais em visão de equipe",
            parameters: {
              type: "object",
              properties: {
                insights_ia: { type: "string", description: "Análise consolidada em texto (markdown)" },
                dores_comuns: {
                  type: "array",
                  items: { type: "object", properties: { dor: { type: "string" }, membros_afetados: { type: "number" }, impacto: { type: "string" } }, required: ["dor", "membros_afetados"] }
                },
                processos_maior_potencial: {
                  type: "array",
                  items: { type: "object", properties: { processo: { type: "string" }, economia_estimada_horas: { type: "number" }, prioridade: { type: "string", enum: ["alta", "media", "baixa"] } }, required: ["processo"] }
                },
                sobreposicoes_esforco: {
                  type: "array",
                  items: { type: "object", properties: { descricao: { type: "string" }, membros: { type: "array", items: { type: "string" } } }, required: ["descricao"] }
                },
                recomendacoes: {
                  type: "array",
                  items: { type: "object", properties: { titulo: { type: "string" }, descricao: { type: "string" }, tipo: { type: "string", enum: ["projeto", "treinamento", "processo", "ferramenta"] } }, required: ["titulo", "descricao"] }
                },
                total_horas_manuais_semana: { type: "number" },
                potencial_economia_horas: { type: "number" }
              },
              required: ["insights_ia", "dores_comuns", "recomendacoes"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "consolidar_diagnostico" } }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      if (response.status === 429) throw new Error("Limite de requisições excedido. Tente novamente em alguns minutos.");
      if (response.status === 402) throw new Error("Créditos insuficientes para IA.");
      throw new Error("Erro ao processar com IA");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou consolidação");

    const consolidado = JSON.parse(toolCall.function.arguments);

    // Upsert into diagnostico_consolidado_skills
    const { data: existing } = await supabase
      .from("diagnostico_consolidado_skills")
      .select("id, versao")
      .eq("equipe_id", equipe_id)
      .maybeSingle();

    const record = {
      equipe_id,
      insights_ia: consolidado.insights_ia,
      dores_comuns: consolidado.dores_comuns,
      processos_maior_potencial: consolidado.processos_maior_potencial || [],
      sobreposicoes_esforco: consolidado.sobreposicoes_esforco || [],
      recomendacoes: consolidado.recomendacoes,
      total_horas_manuais_semana: consolidado.total_horas_manuais_semana || null,
      potencial_economia_horas: consolidado.potencial_economia_horas || null,
      gerado_em: new Date().toISOString(),
      versao: existing ? (existing.versao || 0) + 1 : 1,
    };

    if (existing) {
      await supabase.from("diagnostico_consolidado_skills").update(record).eq("id", existing.id);
    } else {
      await supabase.from("diagnostico_consolidado_skills").insert(record);
    }

    return new Response(JSON.stringify({ success: true, ...record }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
