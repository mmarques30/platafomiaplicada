import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { texto } = await req.json();

    if (!texto || typeof texto !== "string") {
      return new Response(
        JSON.stringify({ error: "Texto é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é um formatador de texto especializado em Markdown. 
Sua tarefa é formatar o texto recebido aplicando formatação Markdown apropriada:

REGRAS OBRIGATÓRIAS:
1. NUNCA remova, altere ou resuma qualquer conteúdo - mantenha 100% do texto original
2. Identifique títulos e seções e aplique # ## ### conforme apropriado
3. Converta listas implícitas para listas com - ou numeração 1. 2. 3.
4. Aplique **negrito** para termos importantes, conceitos-chave ou destaques
5. Use *itálico* para ênfases mais suaves
6. Separe parágrafos com quebras de linha duplas
7. Identifique citações e use > para formatá-las
8. Se houver código, use \`\`\` para blocos de código
9. Mantenha links existentes intactos

IMPORTANTE: O texto de saída deve conter EXATAMENTE o mesmo conteúdo do texto de entrada, apenas com formatação Markdown adicionada.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Formate o seguinte texto aplicando Markdown:\n\n${texto}` }
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API Lovable:", errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao formatar texto" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const textoFormatado = data.choices?.[0]?.message?.content || texto;

    return new Response(
      JSON.stringify({ textoFormatado }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na função formatar-texto-conteudo:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
