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
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all relevant data in parallel
    const [equipeRes, backlogRes, entregasRes, roadmapRes] = await Promise.all([
      supabase.from("equipes_skills").select("*").eq("id", equipe_id).single(),
      supabase.from("backlog_skills").select("*").eq("equipe_id", equipe_id).neq("status", "descartado"),
      supabase.from("entregas_skills").select("*").eq("equipe_id", equipe_id),
      supabase.from("roadmap_skills").select("*").eq("equipe_id", equipe_id).order("semana_inicio", { ascending: true }),
    ]);

    if (equipeRes.error) throw new Error(`Erro ao buscar equipe: ${equipeRes.error.message}`);

    const equipe = equipeRes.data;
    const backlog = backlogRes.data || [];
    const entregas = entregasRes.data || [];
    const roadmap = roadmapRes.data || [];

    const contexto = {
      equipe: {
        nome: equipe.nome,
        investimento: equipe.investimento,
        custo_hora_padrao: equipe.custo_hora_padrao,
        semana_atual: equipe.semana_atual || 1,
        total_membros: equipe.total_membros || 0,
      },
      backlog: backlog.map((p: any) => ({
        titulo: p.titulo,
        status: p.status,
        prioridade: p.prioridade,
        horas_estimadas_economia: p.horas_estimadas_economia,
        area_impactada: p.area_impactada,
      })),
      entregas: entregas.map((e: any) => ({
        titulo: e.titulo,
        status: e.status,
        economia_horas_semana: e.economia_horas_semana,
        prazo: e.prazo,
        progresso: e.progresso,
        concluido_em: e.concluido_em,
        prioridade: e.prioridade,
      })),
      roadmap: roadmap.map((r: any) => ({
        titulo: r.titulo,
        fase: r.fase,
        semana_inicio: r.semana_inicio,
        semana_fim: r.semana_fim,
        status: r.status,
      })),
    };

    const systemPrompt = `Você é um analista de dados especializado em programas de transformação digital e automação com IA.

Seu objetivo é gerar métricas semanais (semanas 1 a 12) para um programa Skills B2B, com foco em ROI e aderência do planejado vs executado.

DADOS RECEBIDOS:
- Equipe: nome, investimento total, custo hora padrão, semana atual
- Backlog: projetos com status, prioridade e economia estimada de horas
- Entregas: com status (pendente/em_andamento/concluida/pausada), economia de horas por semana, prazo, progresso, data de conclusão
- Roadmap: fases com semanas de início e fim

REGRAS DE CÁLCULO:

1. **ROI Projetado (%)**: 
   - Economia total estimada = soma de (economia_horas_semana × 4 semanas × custo_hora_padrao) de TODAS as entregas
   - ROI alvo = (economia total estimada / investimento) × 100
   - Distribuir de forma crescente: semana 1 ≈ 5-10% do alvo, semana 12 = alvo total
   - Crescimento acelerado nas semanas intermediárias

2. **ROI Executado (%)**:
   - Baseado apenas nas entregas com status "concluida" ou "em_andamento"
   - Para entregas concluídas: economia completa
   - Para entregas em andamento: economia × (progresso/100)
   - Acumular semana a semana baseado nos prazos e datas de conclusão
   - Se semana > semana_atual da equipe, roi_executado = roi da última semana real

3. **Horas Economizadas**: acumulado semanal das entregas concluídas e em andamento
   - Crescimento gradual acompanhando as conclusões de entregas

4. **Processos Automatizados**: contagem incremental baseada nas entregas concluídas
   - Distribuir ao longo das 12 semanas

5. **Entregas Planejadas**: quantas deveriam estar prontas até cada semana (baseado nos prazos)
   - Entregas Concluídas: quantas foram efetivamente finalizadas até cada semana

6. **Índice de Maturidade (0-100)**: evolução da maturidade digital da equipe
   - Semana 1: ~15-25%
   - Crescimento gradual
   - Semana 12: ~75-95% dependendo do progresso real

7. **Engajamento Trilhas (0-100)**: estimativa baseada no progresso médio das entregas
   - Correlacionado com entregas concluídas e em andamento

IMPORTANTE:
- Gere EXATAMENTE 12 registros (semanas 1 a 12)
- Valores devem ser coerentes e realistas
- ROI executado NUNCA deve ser maior que ROI projetado para a mesma semana
- Se não há dados suficientes, faça estimativas conservadoras baseadas no investimento e tamanho da equipe`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(contexto) },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "gerar_metricas",
              description: "Gera métricas semanais do programa Skills para 12 semanas",
              parameters: {
                type: "object",
                properties: {
                  metricas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        semana: { type: "number", description: "Número da semana (1-12)" },
                        horas_economizadas: { type: "number", description: "Total de horas economizadas acumulado" },
                        processos_automatizados: { type: "number", description: "Quantidade de processos automatizados" },
                        entregas_concluidas: { type: "number", description: "Entregas efetivamente concluídas" },
                        entregas_planejadas: { type: "number", description: "Entregas que deveriam estar prontas" },
                        indice_maturidade: { type: "number", description: "Índice de maturidade digital (0-100)" },
                        roi_projetado: { type: "number", description: "ROI projetado em %" },
                        roi_executado: { type: "number", description: "ROI executado real em %" },
                        engajamento_trilhas: { type: "number", description: "Engajamento nas trilhas (0-100)" },
                      },
                      required: [
                        "semana",
                        "horas_economizadas",
                        "processos_automatizados",
                        "entregas_concluidas",
                        "entregas_planejadas",
                        "indice_maturidade",
                        "roi_projetado",
                        "roi_executado",
                        "engajamento_trilhas",
                      ],
                    },
                  },
                },
                required: ["metricas"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "gerar_metricas" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Erro na IA: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou métricas");

    const dados = JSON.parse(toolCall.function.arguments);
    const metricas = dados.metricas;

    if (!metricas || !Array.isArray(metricas) || metricas.length === 0) {
      throw new Error("IA retornou métricas inválidas");
    }

    // Delete existing metrics and insert new ones
    const { error: deleteError } = await supabase
      .from("metricas_skills")
      .delete()
      .eq("equipe_id", equipe_id);

    if (deleteError) throw new Error(`Erro ao limpar métricas: ${deleteError.message}`);

    const rows = metricas.map((m: any) => ({
      equipe_id,
      semana: m.semana,
      horas_economizadas: m.horas_economizadas,
      processos_automatizados: m.processos_automatizados,
      entregas_concluidas: m.entregas_concluidas,
      entregas_planejadas: m.entregas_planejadas,
      indice_maturidade: m.indice_maturidade,
      roi_projetado: m.roi_projetado,
      roi_executado: m.roi_executado,
      engajamento_trilhas: m.engajamento_trilhas,
    }));

    const { error: insertError } = await supabase.from("metricas_skills").insert(rows);
    if (insertError) throw new Error(`Erro ao inserir métricas: ${insertError.message}`);

    return new Response(
      JSON.stringify({ success: true, total: metricas.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
