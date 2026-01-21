import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conteudo, tipo, categoria } = await req.json();

    if (!conteudo) {
      return new Response(
        JSON.stringify({ error: 'Conteudo e obrigatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY nao configurada");
    }

    const systemPrompt = `Voce e um assistente especializado em criar metadados para materiais de uma biblioteca de recursos de IA e produtividade.

Analise o conteudo fornecido e gere:
1. TITULO: Resumido, objetivo e claro (maximo 60 caracteres)
2. DESCRICAO: Com bullet points uteis em formato Markdown

REGRAS:
- Titulo deve ser direto e indicar o proposito do material
- Descricao deve ter 3-5 bullet points usando "-" no inicio de cada linha
- Cada bullet point deve ser uma frase curta e util
- Nao use emojis
- Se for um prompt, destaque para qual ferramenta e qual o proposito
- Se for documento, destaque os principais topicos cobertos
- Se for template, destaque os casos de uso
- Seja objetivo e pratico

Retorne APENAS um JSON valido sem markdown:
{
  "titulo": "Titulo resumido aqui",
  "descricao": "- Bullet point 1\\n- Bullet point 2\\n- Bullet point 3"
}`;

    const userPrompt = `Tipo de material: ${tipo || 'nao especificado'}
Categoria/Ferramenta: ${categoria || 'nao especificada'}

Conteudo a analisar:
${conteudo.substring(0, 8000)}`;

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisicoes excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Creditos insuficientes para usar a IA." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("Erro na API:", response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Extrair JSON da resposta (pode vir com ou sem markdown)
    let jsonContent = content.trim();
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const resultado = JSON.parse(jsonContent);

    // Validar campos obrigatorios
    if (!resultado.titulo || !resultado.descricao) {
      throw new Error("Resposta da IA incompleta");
    }

    return new Response(
      JSON.stringify({ success: true, data: resultado }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Erro ao gerar metadados:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao processar" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
