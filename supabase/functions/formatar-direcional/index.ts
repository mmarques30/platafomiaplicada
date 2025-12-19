import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um formatador de texto profissional para direcionais de entregas de mentoria.

Sua tarefa é receber um texto e retornar EXATAMENTE o mesmo conteúdo, mas formatado em Markdown limpo e estruturado.

REGRAS DE FORMATAÇÃO:
1. Identifique itens de lista e converta para bullets usando -
2. Identifique etapas/passos sequenciais e use numeração 1. 2. 3.
3. Use **negrito** para datas, prazos e termos importantes
4. Use → para indicar ações prioritárias ou consequências
5. Agrupe informações relacionadas sob subtítulos ### se apropriado
6. Mantenha parágrafos separados por linhas em branco
7. NÃO adicione, remova ou altere informações
8. NÃO adicione comentários, explicações ou texto adicional
9. Retorne APENAS o texto formatado em Markdown

IMPORTANTE: Preserve 100% do conteúdo original, apenas melhore a formatação visual para facilitar a leitura.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texto } = await req.json();
    
    if (!texto || texto.trim() === "") {
      console.log("Texto vazio recebido");
      return new Response(
        JSON.stringify({ error: "Texto não pode estar vazio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Formatando texto com", texto.length, "caracteres");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não configurada");
      throw new Error("LOVABLE_API_KEY não configurada");
    }

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
          { role: "user", content: texto }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Erro ao processar com IA: " + errorText);
    }

    const aiData = await response.json();
    const textoFormatado = aiData.choices[0].message.content;

    console.log("Texto formatado com sucesso");

    return new Response(
      JSON.stringify({ texto_formatado: textoFormatado }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na função formatar-direcional:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
