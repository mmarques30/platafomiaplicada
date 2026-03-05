import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texto_aditivo, contrato_atual } = await req.json();

    if (!texto_aditivo || texto_aditivo.trim().length < 30) {
      return new Response(
        JSON.stringify({ error: "Texto do aditivo muito curto ou vazio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um assistente especializado em analisar aditivos contratuais e identificar APENAS as alterações em relação ao contrato original.

Você receberá:
1. Os dados ATUAIS do contrato (JSON)
2. O texto do ADITIVO ou documento atualizado

Sua tarefa é comparar e retornar APENAS os campos que foram ALTERADOS ou ADICIONADOS pelo aditivo.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`) com esta estrutura:

{
  "alteracoes": {
    "contratante": { ... campos alterados ... },
    "contrato": { ... campos alterados ... },
    "modulos_selecionados": ["lista atualizada se mudou"],
    "valores": { ... campos alterados ... }
  },
  "resumo_alteracoes": "Resumo em português das principais alterações detectadas no aditivo"
}

REGRAS IMPORTANTES:
- Inclua em "alteracoes" SOMENTE os campos que realmente mudaram
- Se nenhum campo de uma seção mudou, NÃO inclua essa seção
- Valores monetários devem ser apenas números (sem R$)
- Datas no formato YYYY-MM-DD
- O campo "resumo_alteracoes" é obrigatório e deve listar as mudanças de forma clara
- Se o aditivo mencionar novos módulos, retorne a lista COMPLETA atualizada em modulos_selecionados
- NÃO retorne campos que permaneceram iguais
- Retorne APENAS o JSON, sem texto adicional`;

    const userPrompt = `DADOS ATUAIS DO CONTRATO:
${JSON.stringify(contrato_atual, null, 2)}

TEXTO DO ADITIVO/DOCUMENTO ATUALIZADO:
${texto_aditivo}

Analise o aditivo e retorne APENAS os campos que foram alterados.`;

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
          { role: "user", content: userPrompt },
        ],
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
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta da IA vazia");
    }

    let parsed;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair dados estruturados do aditivo" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, dados: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-aditivo-contrato error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
