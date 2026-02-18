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
Sua tarefa é gerar uma descrição detalhada e profissional para um projeto corporativo.

A descrição deve ter 3 parágrafos curtos:
1. **Problema**: O que está sendo resolvido e por que é importante
2. **Solução Proposta**: Como o projeto resolve o problema (incluindo uso de IA/automação quando aplicável)
3. **Resultado Esperado**: Benefícios tangíveis e métricas de sucesso esperadas

Regras:
- Escreva em português brasileiro
- Seja objetivo e prático (máximo 150 palavras total)
- Não use markdown, apenas texto puro com quebras de linha
- Não repita o título na descrição`;

    let userPrompt = `Gere a descrição para o projeto: "${sanitizedTitulo}"`;
    if (sanitizedArea) userPrompt += `\nÁrea impactada: ${sanitizedArea}`;
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
      throw new Error("Erro ao gerar descrição");
    }

    const data = await response.json();
    const descricao = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ descricao }),
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
