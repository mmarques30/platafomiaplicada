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
    const { texto_original } = await req.json();
    
    if (!texto_original || texto_original.trim() === '') {
      throw new Error('texto_original é obrigatório');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um especialista em design de formulários educacionais. 

Sua tarefa é transformar um texto descritivo em um formulário estruturado com perguntas claras e objetivas.

REGRAS:
1. Gere de 5 a 10 perguntas relevantes
2. Use diferentes tipos de pergunta (texto_curto, texto_longo, multipla_escolha, escala)
3. Marque perguntas essenciais como obrigatórias
4. Sugira uma categoria para o formulário
5. Estime o tempo de resposta

Retorne APENAS um JSON válido seguindo este schema:
{
  "perguntas": [
    {
      "id": "q1",
      "tipo": "texto_curto|texto_longo|multipla_escolha|escala|data",
      "pergunta": "Texto da pergunta",
      "obrigatoria": true|false,
      "opcoes": ["Op1", "Op2"], // Apenas para multipla_escolha
      "escala_min": 1, // Apenas para escala
      "escala_max": 5
    }
  ],
  "categoria": "check_in_semanal|avaliacao_projeto|feedback_sessao|outro",
  "tempo_estimado": "5-10 minutos"
}`;

    console.log('📤 Chamando Lovable AI para gerar perguntas...');

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
          { role: "user", content: `Texto do formulário:\n\n${texto_original}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("❌ Rate limit excedido");
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("❌ Créditos insuficientes");
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos ao seu workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("❌ Erro da Lovable AI:", response.status, errorText);
      throw new Error(`Erro na requisição AI: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('📥 Resposta da IA recebida');
    
    // Extrair JSON da resposta (caso venha envolto em markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Não foi possível extrair JSON da resposta:', content);
      throw new Error('Formato de resposta inválido da IA');
    }
    
    const perguntasGeradas = JSON.parse(jsonMatch[0]);
    
    console.log(`✅ ${perguntasGeradas.perguntas?.length || 0} perguntas geradas`);

    return new Response(
      JSON.stringify({ perguntas_geradas: perguntasGeradas }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
