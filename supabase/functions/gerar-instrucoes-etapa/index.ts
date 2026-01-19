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
    const { texto, etapaId, etapaTitulo } = await req.json();

    if (!texto || !etapaId) {
      return new Response(
        JSON.stringify({ error: 'Texto e etapaId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um assistente especializado em organizar transcrições de reuniões de mentoria em tarefas estruturadas.

Analise o texto fornecido e extraia tarefas organizadas por responsável:

1. TAREFAS DO MENTORADO (responsavel: 'voce'):
   - Ações que o mentorado deve executar sozinho
   - Identifique a ferramenta: 'claude' (para prompts/IA), 'lovable' (para desenvolvimento), 'outro' (para outras ações)
   - Se for tarefa de Claude, sugira um prompt específico

2. TAREFAS DO MENTOR (responsavel: 'mentor'):
   - Ações que o mentor vai realizar
   - Revisões, feedbacks, preparações

3. TAREFAS CONJUNTAS (responsavel: 'conjunto'):
   - Ações para fazer na próxima reunião
   - Validações, discussões, decisões
   - Use ferramenta: 'reuniao'

4. MARCOS PARA PRÓXIMA ETAPA:
   - O que deve estar pronto/funcionando
   - Entregáveis concretos

IMPORTANTE:
- Seja objetivo e claro nas descrições
- Não use emojis
- Ordene as tarefas por prioridade/sequência lógica
- Prompts sugeridos devem ser detalhados e prontos para usar

Retorne APENAS um JSON válido no formato:
{
  "instrucoes": [
    {
      "titulo": "Título claro e objetivo",
      "descricao": "Descrição detalhada da tarefa",
      "responsavel": "voce|mentor|conjunto",
      "ferramenta": "claude|lovable|reuniao|outro",
      "ordem": 1,
      "prompt_sugerido": "Prompt completo se for tarefa de Claude, null caso contrário",
      "dicas": "Dicas úteis se houver, null caso contrário"
    }
  ],
  "marcos": ["Marco 1", "Marco 2", "Marco 3"]
}`;

    const userPrompt = `Etapa: ${etapaTitulo || 'Não especificada'}

Transcrição/Documento:
${texto}`;

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
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
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

    // Extrair JSON da resposta (pode vir com markdown)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const resultado = JSON.parse(jsonContent);

    // Validar estrutura
    if (!resultado.instrucoes || !Array.isArray(resultado.instrucoes)) {
      throw new Error("Formato de resposta inválido");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: resultado,
        etapaId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Erro ao processar:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar transcrição" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
