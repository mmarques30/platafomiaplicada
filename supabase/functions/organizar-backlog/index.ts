import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { texto } = await req.json();

    if (!texto || !texto.trim()) {
      return new Response(
        JSON.stringify({ items: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("=== ORGANIZANDO BACKLOG ===");
    console.log(`Texto recebido: ${texto.length} caracteres`);

    // Prompt ultra-restritivo para APENAS organizar, não inventar
    const prompt = `VOCÊ É UM ORGANIZADOR DE LISTA - NÃO UM CRIADOR.

TEXTO DO USUÁRIO:
${texto}

═══════════════════════════════════════════════════════════════
SUA TAREFA:
═══════════════════════════════════════════════════════════════

1. Extrair CADA item da lista acima (identifique por bullets -, •, *, numeração, ou quebra de linha)
2. Categorizar em: "Pós-MVP", "Melhorias Futuras" ou "Débito Técnico"
3. Sugerir prioridade baseada no contexto: "baixa", "media", "alta"

═══════════════════════════════════════════════════════════════
PROIBIÇÕES ABSOLUTAS:
═══════════════════════════════════════════════════════════════

❌ PROIBIDO adicionar itens que NÃO estão no texto
❌ PROIBIDO modificar os títulos (apenas corrigir formatação básica)
❌ PROIBIDO inventar descrições elaboradas
❌ PROIBIDO resumir ou combinar itens
❌ PROIBIDO adicionar funcionalidades genéricas

Cada item do texto = 1 item no JSON. NÃO CRIE MAIS ITENS.

Retorne APENAS JSON válido:
{
  "items": [
    {
      "titulo": "Título exato do texto (pode corrigir erros de digitação)",
      "descricao": "",
      "categoria": "Pós-MVP",
      "prioridade": "media"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
        temperature: 0, // DETERMINÍSTICO
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Extrair JSON da resposta
    let parsed;
    try {
      const cleaned = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsed = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
      } else {
        parsed = { items: [] };
      }
    } catch (e) {
      console.error("Erro ao parsear JSON:", e);
      parsed = { items: [] };
    }

    console.log(`Itens organizados: ${parsed.items?.length || 0}`);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erro:", error);

    return new Response(
      JSON.stringify({ error: error?.message || "Erro desconhecido", items: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
