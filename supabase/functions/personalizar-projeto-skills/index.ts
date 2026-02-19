import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { titulo, descricao_atual, area_impactada } = await req.json();

    if (!titulo || typeof titulo !== "string" || titulo.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Título é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sanitizedTitulo = titulo.trim().slice(0, 200);
    const sanitizedArea = area_impactada ? String(area_impactada).trim().slice(0, 100) : "";
    const sanitizedDescAtual = descricao_atual ? String(descricao_atual).trim().slice(0, 2000) : "";

    const systemPrompt = `Você é um consultor especialista em transformação digital e automação com IA para empresas.
Sua tarefa é analisar um projeto corporativo e preencher todos os campos necessários.

Regras:
- Escreva em português brasileiro
- A descrição deve ter 3 parágrafos curtos (problema, solução, resultado esperado), máximo 150 palavras, texto puro sem markdown
- A área impactada deve ser um departamento ou função (ex: Financeiro, RH, Operações, Comercial, TI, Marketing, Jurídico, Atendimento)
- A prioridade deve ser p1 (urgente/alto impacto), p2 (importante/médio impacto) ou p3 (desejável/baixo impacto)
- As horas de economia estimadas devem ser um número realista entre 1 e 40 horas por semana`;

    let userPrompt = `Analise o projeto: "${sanitizedTitulo}"`;
    if (sanitizedArea) userPrompt += `\nÁrea impactada informada: ${sanitizedArea}`;
    if (sanitizedDescAtual) userPrompt += `\nDescrição atual (use como base para melhorar): ${sanitizedDescAtual}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: [
          {
            type: "function",
            function: {
              name: "preencher_projeto",
              description: "Preenche todos os campos de um projeto corporativo de automação/IA",
              parameters: {
                type: "object",
                properties: {
                  descricao: {
                    type: "string",
                    description: "Descrição do projeto em 3 parágrafos curtos (problema, solução, resultado). Texto puro sem markdown.",
                  },
                  area_impactada: {
                    type: "string",
                    description: "Departamento ou área da empresa impactada pelo projeto (ex: Financeiro, RH, Operações)",
                  },
                  prioridade: {
                    type: "string",
                    enum: ["p1", "p2", "p3"],
                    description: "Prioridade do projeto: p1 (urgente), p2 (importante), p3 (desejável)",
                  },
                  horas_estimadas_economia: {
                    type: "number",
                    description: "Estimativa de horas economizadas por semana (entre 1 e 40)",
                  },
                },
                required: ["descricao", "area_impactada", "prioridade", "horas_estimadas_economia"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "preencher_projeto" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar dados do projeto");
    }

    const data = await response.json();
    
    // Extract tool call arguments
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      // Fallback: try to use content as before
      const descricao = data.choices?.[0]?.message?.content?.trim() || "";
      return new Response(
        JSON.stringify({ descricao }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        descricao: result.descricao || "",
        area_impactada: result.area_impactada || "",
        prioridade: result.prioridade || "p2",
        horas_estimadas_economia: result.horas_estimadas_economia || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("personalizar-projeto-skills error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
