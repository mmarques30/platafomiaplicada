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
    const { texto, modulos_contratados, contexto_cliente } = await req.json();

    if (!texto) {
      throw new Error("Texto do documento é obrigatório");
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const modulosLista = modulos_contratados?.length > 0 
      ? modulos_contratados.join(", ") 
      : "Não especificados";

    const prompt = `Você é um assistente especializado em analisar propostas comerciais e transcrições de calls de vendas para projetos de consultoria de IA.

Analise o seguinte documento e extraia as entregas do projeto, separando em:
1. ENTREGAS ATIVAS: o que será implementado agora (prioridade alta/média)
2. BACKLOG: entregas futuras ou de menor prioridade
3. INSTRUÇÕES DE EXECUÇÃO: passos para implementar cada entrega (se aplicável)

MÓDULOS CONTRATADOS: ${modulosLista}
${contextoCliente ? `CONTEXTO DO CLIENTE: ${contextoCliente}` : ""}

DOCUMENTO A ANALISAR:
${texto}

Responda APENAS com um JSON válido neste formato exato:
{
  "entregas_sugeridas": [
    {
      "titulo": "Nome da entrega",
      "descricao": "Descrição detalhada",
      "modulo_relacionado": "CRM",
      "tipo": "ativa",
      "prioridade": "alta",
      "tarefas": [
        { "titulo": "Tarefa para validação", "descricao": "O que validar", "prioridade": "alta" }
      ]
    }
  ],
  "instrucoes_sugeridas": [
    {
      "entrega_titulo": "Nome da entrega",
      "instrucoes": [
        {
          "titulo": "Passo de execução",
          "descricao": "Como executar",
          "responsavel": "voce",
          "ferramenta": "claude",
          "prompt_sugerido": "Prompt para usar na ferramenta",
          "tarefas": [
            { "titulo": "Subtarefa", "prioridade": "media" }
          ]
        }
      ]
    }
  ],
  "backlog_sugerido": [
    {
      "titulo": "Entrega futura",
      "descricao": "Descrição",
      "justificativa": "Por que está no backlog"
    }
  ]
}

REGRAS:
- "tipo" deve ser "ativa" ou "backlog"
- "prioridade" deve ser "baixa", "media" ou "alta"
- "responsavel" deve ser "voce" (mentorado), "mentor" ou "conjunto"
- "ferramenta" pode ser "claude", "lovable", "chatgpt", "notion", "outro"
- Seja específico nas tarefas de validação
- Instruções só são necessárias para entregas que o mentorado vai co-criar
- Backlog é para entregas futuras ou de baixa prioridade`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API:", errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const result = await response.json();
    const content = result.content[0].text;

    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Não foi possível extrair JSON da resposta");
    }

    const parsedResult = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
