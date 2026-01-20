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
    
    if (!texto || texto.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Texto do contrato muito curto ou vazio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um assistente especializado em analisar contratos de prestação de serviços de consultoria empresarial e IA.
    
Extraia do texto fornecido as seguintes informações e retorne APENAS um JSON válido (sem markdown, sem \`\`\`):

{
  "contratante": {
    "razao_social": "nome da empresa contratante",
    "cnpj": "XX.XXX.XXX/XXXX-XX",
    "endereco": "endereço completo",
    "representante_nome": "nome do representante legal",
    "representante_cpf": "XXX.XXX.XXX-XX",
    "representante_rg": "número do RG",
    "representante_email": "email@empresa.com"
  },
  "contrato": {
    "data_inicio": "YYYY-MM-DD",
    "data_fim": "YYYY-MM-DD",
    "data_assinatura": "YYYY-MM-DD",
    "tempo_consultoria_meses": 6,
    "modulos_contratados": 5,
    "reunioes_mensais": 4,
    "reports_frequencia": "quinzenal",
    "suporte_tipo": "chat"
  },
  "modulos_selecionados": ["CRM", "Financeiro", "Geração de Documentos"],
  "valores": {
    "valor_contrato": 50000,
    "valor_entrada": 10000,
    "numero_parcelas": 6,
    "valor_parcela": 6666.67,
    "creditos_iniciais": 300,
    "valor_credito_adicional": 1,
    "duracao_academy_meses": 12,
    "roi_projetado": 200,
    "multa_rescisao_percentual": 30,
    "valor_hora_tecnica": 250
  },
  "entregas_esperadas": [
    {
      "titulo": "Diagnóstico inicial",
      "tipo": "documento",
      "prazo": "Semana 1",
      "status": "pendente"
    }
  ]
}

REGRAS:
- Se algum campo não for encontrado, use null
- Valores monetários devem ser apenas números (sem R$, sem pontos de milhar)
- Datas no formato YYYY-MM-DD
- modulos_selecionados deve ser um array de strings
- entregas_esperadas deve ser um array de objetos
- Retorne APENAS o JSON, sem nenhum texto adicional`;

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
          { role: "user", content: `Analise o seguinte texto de contrato e extraia as informações:\n\n${texto}` }
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

    // Tentar extrair JSON da resposta
    let parsed;
    try {
      // Remove possíveis markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair dados estruturados do texto" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, dados: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("parse-contrato-texto error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
