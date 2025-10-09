import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formulario_id } = await req.json();
    
    if (!formulario_id) {
      throw new Error('formulario_id é obrigatório');
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📊 Buscando formulário e respostas...');

    // Buscar formulário e respostas
    const { data: formulario, error: formError } = await supabase
      .from('formularios_customizados')
      .select('*')
      .eq('id', formulario_id)
      .single();

    if (formError) throw formError;

    const { data: respostas, error: respError } = await supabase
      .from('respostas_formularios_customizados')
      .select('*, profiles!inner(nome_completo)')
      .eq('formulario_id', formulario_id)
      .eq('completado', true);

    if (respError) throw respError;

    if (!respostas || respostas.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma resposta encontrada para análise' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📝 ${respostas.length} respostas encontradas`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Preparar contexto para IA
    const contexto = `
FORMULÁRIO: ${formulario.titulo}
PERGUNTAS:
${JSON.stringify(formulario.perguntas_geradas.perguntas, null, 2)}

RESPOSTAS (${respostas.length} mentorados):
${respostas.map((r: any) => `
--- ${r.profiles.nome_completo} ---
${JSON.stringify(r.respostas, null, 2)}
`).join('\n')}
`;

    const systemPrompt = `Você é um especialista em análise de feedback educacional de programas de mentoria.

Analise as respostas dos mentorados e forneça:
1. Padrões identificados nas respostas
2. Pontos de atenção (mentorados que podem precisar de mais suporte)
3. Insights acionáveis para o mentor
4. Recomendações de próximos passos

Retorne APENAS um JSON válido seguindo este schema:
{
  "resumo": "Resumo geral das respostas em 2-3 frases",
  "padrao_geral": "Principais padrões identificados",
  "mentorados_atencao": [
    {
      "nome": "Nome do mentorado",
      "motivo": "Por que precisa de atenção especial"
    }
  ],
  "insights": [
    "Insight acionável 1",
    "Insight acionável 2"
  ],
  "recomendacoes": [
    "Recomendação específica 1",
    "Recomendação específica 2"
  ]
}`;

    console.log('📤 Chamando Lovable AI para análise...');

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
          { role: "user", content: contexto }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
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
    
    console.log('📥 Análise recebida');
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Não foi possível extrair JSON da resposta');
      throw new Error('Formato de resposta inválido da IA');
    }
    
    const analise = JSON.parse(jsonMatch[0]);
    
    console.log('✅ Análise concluída');

    return new Response(
      JSON.stringify({ analise }),
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
