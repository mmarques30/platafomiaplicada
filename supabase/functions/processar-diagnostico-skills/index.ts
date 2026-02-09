import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnostico_id } = await req.json();
    if (!diagnostico_id) {
      return new Response(JSON.stringify({ error: "diagnostico_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar usuário
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar diagnóstico SEM filtro de user_id (admin pode processar de qualquer membro)
    const { data: diagnostico, error: fetchError } = await supabase
      .from("diagnosticos_skills")
      .select("*")
      .eq("id", diagnostico_id)
      .single();

    if (fetchError || !diagnostico) {
      return new Response(JSON.stringify({ error: "Diagnóstico não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar permissão: dono ou admin
    const isOwner = diagnostico.user_id === user.id;
    if (!isOwner) {
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Sem permissão para processar este diagnóstico" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Montar contexto para IA
    const contexto = montarContexto(diagnostico);

    // Chamar Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: contexto },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "gerar_analise_diagnostico",
              description: "Gera análise completa do diagnóstico Skills com processos, economia e trilha personalizada",
              parameters: {
                type: "object",
                properties: {
                  perfil: {
                    type: "object",
                    properties: {
                      cargo: { type: "string" },
                      area: { type: "string" },
                      nivelTecnico: { type: "string" },
                      disponibilidade: { type: "string" },
                    },
                    required: ["cargo", "area", "nivelTecnico", "disponibilidade"],
                  },
                  processos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        nome: { type: "string" },
                        frequencia: { type: "string" },
                        tempo: { type: "string" },
                        impacto: { type: "string", enum: ["Alto", "Médio", "Baixo"] },
                        potencialAutomacao: { type: "number", description: "Percentual de 0 a 100" },
                      },
                      required: ["nome", "frequencia", "tempo", "impacto", "potencialAutomacao"],
                    },
                  },
                  economia: {
                    type: "object",
                    properties: {
                      horasSemana: { type: "number", description: "Horas economizadas por semana" },
                      economiaEstimada: { type: "string", description: "Texto descritivo ex: 10-12h/sem" },
                      valorMensal: { type: "number", description: "Valor em reais" },
                    },
                    required: ["horasSemana", "economiaEstimada", "valorMensal"],
                  },
                  trilha: {
                    type: "object",
                    properties: {
                      modulos: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            nome: { type: "string" },
                            descricao: { type: "string" },
                            prioridade: { type: "string", enum: ["Alta", "Média", "Baixa"] },
                          },
                          required: ["nome", "descricao", "prioridade"],
                        },
                      },
                      tempoEstimado: { type: "string" },
                      prioridades: { type: "array", items: { type: "string" } },
                    },
                    required: ["modulos", "tempoEstimado", "prioridades"],
                  },
                  insights: {
                    type: "object",
                    properties: {
                      analise: { type: "string", description: "Análise geral do perfil em 2-3 parágrafos" },
                      oportunidades: { type: "array", items: { type: "string" } },
                      primeirosPassos: { type: "array", items: { type: "string" } },
                    },
                    required: ["analise", "oportunidades", "primeirosPassos"],
                  },
                },
                required: ["perfil", "processos", "economia", "trilha", "insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "gerar_analise_diagnostico" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", status, errorText);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro ao processar com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("AI response sem tool_calls:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "Resposta da IA inválida" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resultado = JSON.parse(toolCall.function.arguments);

    // Salvar resultados no banco
    const { error: updateError } = await supabase
      .from("diagnosticos_skills")
      .update({
        insight_ia: resultado,
        insight_gerado_em: new Date().toISOString(),
        economia_horas_semana: resultado.economia?.horasSemana || 0,
        economia_valor_mensal: resultado.economia?.valorMensal || 0,
        trilha_sugerida: resultado.trilha,
        processos_analisados: resultado.processos,
        updated_at: new Date().toISOString(),
      })
      .eq("id", diagnostico_id);

    if (updateError) {
      console.error("Erro ao salvar resultados:", updateError);
      return new Response(JSON.stringify({ error: "Erro ao salvar resultados" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, resultado }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Erro na edge function:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

const SYSTEM_PROMPT = `Você é um especialista em transformação digital e automação de processos corporativos.
Sua função é analisar o diagnóstico de um colaborador de uma empresa que está participando de um programa de capacitação em IA e automação.

Com base nas respostas do formulário, você deve:

1. PROCESSOS: Identificar e classificar os processos mais impactantes para automação
   - Classificar impacto como Alto, Médio ou Baixo
   - Estimar potencial de automação (0-100%)
   - Considerar frequência, tempo gasto e impacto no negócio

2. ECONOMIA: Calcular economia potencial realista
   - Horas por semana que podem ser economizadas
   - Valor monetário mensal (considerando R$60/hora como base)
   - Ser conservador nas estimativas (50-70% do máximo teórico)

3. TRILHA: Recomendar módulos de estudo personalizados
   - Baseados no nível técnico e área de atuação
   - Priorizar módulos que resolvam as dores principais
   - Incluir tempo estimado total de estudo

4. INSIGHTS: Gerar análise estratégica
   - Análise do perfil em 2-3 parágrafos
   - 3-5 oportunidades de automação
   - 3-4 primeiros passos práticos e acionáveis

Seja realista, prático e específico. Evite generalidades.`;

function montarContexto(d: any): string {
  const partes = [
    `## Perfil`,
    `- Cargo: ${d.cargo || "Não informado"}`,
    `- Área: ${d.area_atuacao || "Não informada"}`,
    `- Tempo na função: ${d.tempo_na_empresa || "Não informado"}`,
    `- Nível técnico: ${d.nivel_tecnico || "Não informado"}`,
    `- Uso de IA: ${d.uso_ia || d.ja_usou_ia || "Não informado"}`,
    ``,
    `## Rotina`,
    `- Horas em tarefas repetitivas: ${d.horas_repetitivas || "Não informado"}`,
    `- Atividade principal: ${d.atividade_principal || "Não informada"}`,
    `- Frequência: ${d.frequencia_atividade || "Não informada"}`,
    `- Tempo gasto por vez: ${d.tempo_gasto || "Não informado"}`,
    ``,
    `## Ferramentas`,
    `- Ferramentas atuais: ${JSON.stringify(d.ferramentas_atuais || [])}`,
    `- Ferramentas de automação: ${JSON.stringify(d.ferramentas_automacao || [])}`,
    ``,
    `## Processos Detalhados`,
    `${JSON.stringify(d.processos_detalhados || [], null, 2)}`,
    ``,
    `## Processos gerais`,
    `- Processos mais demorados: ${d.processos_mais_demorados || "Não informado"}`,
    `- Processos repetitivos: ${d.processos_repetitivos || "Não informado"}`,
    `- Gargalos: ${JSON.stringify(d.gargalos_identificados || [])}`,
    `- Onde perde mais tempo: ${d.onde_perde_mais_tempo || "Não informado"}`,
    ``,
    `## Objetivos`,
    `- Objetivos com IA: ${JSON.stringify(d.objetivos_ia || [])}`,
    `- Resultado de sucesso: ${d.resultado_sucesso || "Não informado"}`,
    `- Autonomia: ${d.autonomia || "Não informada"}`,
    ``,
    `## Disponibilidade`,
    `- Horas por semana: ${d.horas_semana || "Não informado"}`,
    `- Melhor horário: ${JSON.stringify(d.melhor_horario || [])}`,
    `- Preferência de conteúdo: ${d.preferencia_conteudo || "Não informada"}`,
    ``,
    `## Empresa`,
    `- Tamanho da área: ${d.tamanho_area || "Não informado"}`,
    `- Sistemas ERP: ${JSON.stringify(d.sistemas_erp || [])}`,
    `- Iniciativas de IA: ${d.iniciativas_ia || "Não informado"}`,
    `- Maturidade digital: ${d.maturidade_digital || "Não informada"}`,
    ``,
    `## Desafios`,
    `- Desafios: ${JSON.stringify(d.desafios || [])}`,
    `- Processo colaborativo: ${d.processo_colaborativo || "Não informado"}`,
    `- O que automatizaria: ${d.automatizar_empresa || "Não informado"}`,
    ``,
    `## Contexto Organizacional`,
    `- Apoio da liderança: ${d.apoio_lideranca || "Não informado"}`,
    `- Restrições de TI: ${d.restricoes_ti || "Não informadas"}`,
    `- Objetivo do programa: ${JSON.stringify(d.objetivo_programa || [])}`,
    `- Áreas para automação: ${JSON.stringify(d.areas_automacao || [])}`,
    ``,
    `## Expectativas`,
    `- Resultado para equipe: ${d.resultado_equipe || "Não informado"}`,
    `- Projeto colaborativo: ${d.projeto_colaborativo || "Não informado"}`,
    `- Barreiras: ${d.barreiras || "Não informadas"}`,
  ];

  return partes.join("\n");
}
