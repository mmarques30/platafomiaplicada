import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texto } = await req.json();
    if (!texto || texto.length < 50) return new Response(JSON.stringify({ error: "Texto muito curto" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `Você é um assistente que extrai dados estruturados de contratos de programas Skills (treinamento B2B de equipes em IA e automação). Extraia os dados e retorne usando a função fornecida.` },
          { role: "user", content: texto }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extrair_contrato_skills",
            description: "Extrai dados estruturados de um contrato Skills",
            parameters: {
              type: "object",
              properties: {
                contratante: {
                  type: "object",
                  properties: {
                    empresa_nome: { type: "string" },
                    cnpj: { type: "string" },
                    representante_nome: { type: "string" },
                    representante_email: { type: "string" }
                  }
                },
                programa: {
                  type: "object",
                  properties: {
                    duracao_programa_semanas: { type: "number" },
                    frequencia_encontros: { type: "string", enum: ["semanal", "quinzenal", "mensal"] },
                    data_inicio: { type: "string" },
                    data_fim: { type: "string" }
                  }
                },
                valores: {
                  type: "object",
                  properties: {
                    valor_contrato: { type: "number" },
                    roi_projetado: { type: "number" }
                  }
                },
                projetos_por_trilha: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      trilha_titulo: { type: "string" },
                      projetos: { type: "array", items: { type: "object", properties: { titulo: { type: "string" }, descricao: { type: "string" } }, required: ["titulo"] } }
                    },
                    required: ["trilha_titulo", "projetos"]
                  }
                },
                observacoes: { type: "string" }
              },
              required: ["contratante"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extrair_contrato_skills" } }
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao processar com IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return new Response(JSON.stringify({ error: "IA não retornou dados estruturados" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const dados = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ success: true, dados }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
