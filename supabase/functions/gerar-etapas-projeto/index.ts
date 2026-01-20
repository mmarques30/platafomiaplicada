import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { contrato } = await req.json();

    if (!contrato) {
      return new Response(
        JSON.stringify({ error: 'Dados do contrato são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      modulos_selecionados = [],
      tempo_consultoria_meses = 6,
      reunioes_mensais = 2,
      fases_projeto = [],
      entregas_esperadas = [],
      contexto_transformacao = '',
      dores_mapeadas = [],
      nome_empresa = 'Cliente',
      data_inicio = new Date().toISOString(),
    } = contrato;

    // Calcular total de etapas baseado em reuniões
    const totalEtapas = reunioes_mensais * tempo_consultoria_meses;
    
    // Calcular duração de cada etapa em dias
    const duracaoProjeto = tempo_consultoria_meses * 30; // em dias
    const diasPorEtapa = Math.floor(duracaoProjeto / totalEtapas);

    // Preparar contexto para IA
    const modulosTexto = modulos_selecionados.length > 0 
      ? modulos_selecionados.map((m: any) => m.nome || m).join(', ')
      : 'Módulos padrão de consultoria';

    const doresTexto = Array.isArray(dores_mapeadas) && dores_mapeadas.length > 0
      ? dores_mapeadas.join('; ')
      : 'Otimização de processos com IA';

    const entregasTexto = Array.isArray(entregas_esperadas) && entregas_esperadas.length > 0
      ? entregas_esperadas.map((e: any) => e.titulo || e).join(', ')
      : 'Entregas definidas durante o projeto';

    const prompt = `Você é um especialista em consultoria de IA para empresas. Crie um roadmap detalhado de ${totalEtapas} etapas para um projeto de consultoria.

CONTEXTO DO PROJETO:
- Empresa: ${nome_empresa}
- Duração: ${tempo_consultoria_meses} meses
- Reuniões: ${reunioes_mensais} por mês (total: ${totalEtapas} encontros)
- Módulos contratados: ${modulosTexto}
- Contexto da transformação: ${contexto_transformacao || 'Implementação de IA nos processos'}
- Principais dores: ${doresTexto}
- Entregas esperadas: ${entregasTexto}

REGRAS:
1. A primeira etapa SEMPRE deve ser "Kickoff e Alinhamento Estratégico"
2. A última etapa SEMPRE deve ser "Encerramento e Handoff"
3. Distribua os módulos ao longo das etapas de forma lógica
4. Cada etapa deve ter 2-3 marcos para a próxima etapa
5. Os objetivos devem ser específicos e mensuráveis

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicações):
{
  "etapas": [
    {
      "numero_etapa": 1,
      "titulo": "Título da Etapa",
      "objetivo": "Objetivo específico desta etapa",
      "marcos_proxima_etapa": ["Marco 1", "Marco 2"]
    }
  ]
}`;

    // Chamar Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em criar roadmaps de consultoria. Responda APENAS com JSON válido, sem markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("Erro na API:", errorText);
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Limpar resposta (remover possível markdown)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    // Parse do JSON
    const parsed = JSON.parse(cleanContent);

    // Adicionar datas calculadas a cada etapa
    const dataInicio = new Date(data_inicio);
    const etapasComDatas = parsed.etapas.map((etapa: any, index: number) => {
      const dataPrevista = new Date(dataInicio);
      dataPrevista.setDate(dataPrevista.getDate() + (index * diasPorEtapa));
      
      return {
        ...etapa,
        data_prevista: dataPrevista.toISOString().split('T')[0],
        status: 'pendente'
      };
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        etapas: etapasComDatas,
        meta: {
          total_etapas: totalEtapas,
          dias_por_etapa: diasPorEtapa,
          duracao_meses: tempo_consultoria_meses
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error("Erro ao gerar etapas:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar etapas';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
