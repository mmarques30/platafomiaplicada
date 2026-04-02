import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { contrato_id, user_id, periodo, tipo = 'mensal' } = await req.json();

    if (!contrato_id || !user_id || typeof contrato_id !== 'string' || typeof user_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'contrato_id e user_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do contrato
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos_business')
      .select('*')
      .eq('id', contrato_id)
      .single();

    if (contratoError || !contrato) {
      throw new Error('Contrato não encontrado');
    }

    // Buscar perfil do mentorado
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome_completo, email, empresa')
      .eq('id', user_id)
      .single();

    // Buscar etapas
    const { data: etapas } = await supabase
      .from('etapas_business')
      .select('*')
      .eq('contrato_id', contrato_id)
      .order('numero_etapa', { ascending: true });

    // Buscar entregas
    const { data: entregas } = await supabase
      .from('entregas_business')
      .select('*')
      .eq('contrato_id', contrato_id);

    // Buscar tarefas do mentorado
    const { data: tarefas } = await supabase
      .from('tarefas_mentoria')
      .select('*')
      .eq('user_id', user_id);

    // Buscar progresso em vídeos
    const { data: progressoVideos } = await supabase
      .from('progresso_videos')
      .select('*')
      .eq('user_id', user_id)
      .eq('completado', true);

    // Calcular métricas
    const etapasConcluidas = etapas?.filter(e => e.status === 'concluida').length || 0;
    const etapasTotal = etapas?.length || 0;
    const progressoEtapas = etapasTotal > 0 ? Math.round((etapasConcluidas / etapasTotal) * 100) : 0;

    const entregasConcluidas = entregas?.filter(e => e.status === 'concluida').length || 0;
    const entregasTotal = entregas?.length || 0;
    const progressoEntregas = entregasTotal > 0 ? Math.round((entregasConcluidas / entregasTotal) * 100) : 0;

    const tarefasConcluidas = tarefas?.filter(t => t.status === 'concluida').length || 0;
    const tarefasTotal = tarefas?.length || 0;

    const videosAssistidos = progressoVideos?.length || 0;

    const metricas = {
      etapas: { concluidas: etapasConcluidas, total: etapasTotal, percentual: progressoEtapas },
      entregas: { concluidas: entregasConcluidas, total: entregasTotal, percentual: progressoEntregas },
      tarefas: { concluidas: tarefasConcluidas, total: tarefasTotal },
      videos_assistidos: videosAssistidos,
    };

    // Preparar contexto para IA
    const etapasInfo = etapas?.map(e => `- ${e.titulo}: ${e.status}`).join('\n') || 'Nenhuma etapa cadastrada';
    const entregasInfo = entregas?.map(e => `- ${e.titulo}: ${e.status}`).join('\n') || 'Nenhuma entrega cadastrada';

    const prompt = `Você é um consultor de negócios da IAplicada. Gere um report executivo ${tipo} para o cliente.

DADOS DO PROJETO:
- Cliente: ${profile?.nome_completo || 'Cliente'} (${contrato.nome_empresa || 'Empresa'})
- Período: ${periodo || 'Período atual'}
- Duração do contrato: ${contrato.tempo_consultoria_meses} meses

PROGRESSO:
- Etapas: ${etapasConcluidas}/${etapasTotal} concluídas (${progressoEtapas}%)
- Entregas: ${entregasConcluidas}/${entregasTotal} concluídas (${progressoEntregas}%)
- Tarefas: ${tarefasConcluidas}/${tarefasTotal} concluídas
- Vídeos assistidos: ${videosAssistidos}

ETAPAS:
${etapasInfo}

ENTREGAS:
${entregasInfo}

Gere um report com:
1. Resumo executivo (3-4 parágrafos)
2. 3-5 destaques do período
3. 3-5 próximos passos recomendados
4. Observações/recomendações

Responda APENAS com JSON válido:
{
  "resumo_executivo": "texto...",
  "destaques": ["destaque 1", "destaque 2"],
  "proximos_passos": ["passo 1", "passo 2"],
  "observacoes": "texto..."
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
            content: "Você é um consultor de negócios especializado em IA. Gere reports executivos profissionais. Responda APENAS com JSON válido."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const aiResponse = await response.json();
    let content = aiResponse.choices[0]?.message?.content || '';

    // Limpar markdown
    content = content.trim();
    if (content.startsWith("```json")) content = content.slice(7);
    if (content.startsWith("```")) content = content.slice(3);
    if (content.endsWith("```")) content = content.slice(0, -3);
    content = content.trim();

    const parsed = JSON.parse(content);

    // Gerar HTML do report
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const conteudoHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Report ${tipo} - ${contrato.nome_empresa}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
    .header { border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
    .meta { color: #666; font-size: 14px; margin-top: 10px; }
    h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 10px; }
    h2 { color: #7c3aed; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .metric { background: #f8f8f8; padding: 15px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 28px; font-weight: bold; color: #7c3aed; }
    .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
    .section { margin: 25px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; line-height: 1.6; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">IAplicada</div>
    <h1>Report ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - ${periodo || dataAtual}</h1>
    <div class="meta">
      <strong>${contrato.nome_empresa || profile?.nome_completo}</strong> | 
      Gerado em ${dataAtual}
    </div>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-value">${progressoEtapas}%</div>
      <div class="metric-label">Progresso Etapas</div>
    </div>
    <div class="metric">
      <div class="metric-value">${entregasConcluidas}/${entregasTotal}</div>
      <div class="metric-label">Entregas</div>
    </div>
    <div class="metric">
      <div class="metric-value">${tarefasConcluidas}</div>
      <div class="metric-label">Tarefas Concluídas</div>
    </div>
    <div class="metric">
      <div class="metric-value">${videosAssistidos}</div>
      <div class="metric-label">Vídeos Assistidos</div>
    </div>
  </div>

  <div class="section">
    <h2>Resumo Executivo</h2>
    <p>${parsed.resumo_executivo}</p>
  </div>

  <div class="section">
    <h2>Destaques do Período</h2>
    <ul>
      ${parsed.destaques.map((d: string) => `<li>${d}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>Próximos Passos</h2>
    <ul>
      ${parsed.proximos_passos.map((p: string) => `<li>${p}</li>`).join('')}
    </ul>
  </div>

  ${parsed.observacoes ? `
  <div class="section">
    <h2>Observações</h2>
    <p>${parsed.observacoes}</p>
  </div>
  ` : ''}

  <div class="footer">
    Este report foi gerado automaticamente pela plataforma IAplicada.
  </div>
</body>
</html>`;

    return new Response(
      JSON.stringify({
        success: true,
        titulo: `Report ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - ${periodo || dataAtual}`,
        resumo_executivo: parsed.resumo_executivo,
        destaques: parsed.destaques,
        proximos_passos: parsed.proximos_passos,
        observacoes: parsed.observacoes,
        metricas,
        conteudo_html: conteudoHtml,
        periodo_referencia: periodo || dataAtual,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error("Erro ao gerar report:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar report';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
