import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar diagnóstico do mentorado
    const { data: diagnostico, error: diagError } = await supabase
      .from('formulario_diagnostico')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (diagError) throw diagError;

    if (!diagnostico) {
      throw new Error('Diagnóstico não encontrado');
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome_completo, profissao')
      .eq('id', userId)
      .single();

    // Preparar prompt para IA
    const prompt = `
Você é um mentor de IA especializado em criar planos de desenvolvimento personalizados.

Analise as informações do diagnóstico abaixo e crie um plano de mentoria estruturado:

**PERFIL:**
- Nome: ${profile?.nome_completo || 'Não informado'}
- Profissão: ${diagnostico.profissao || profile?.profissao || 'Não informado'}
- Área de atuação: ${diagnostico.area_atuacao || 'Não informado'}
- Tempo de experiência: ${diagnostico.tempo_experiencia || 'Não informado'}

**OBJETIVOS:**
- Objetivo principal: ${diagnostico.objetivo_principal || 'Não informado'}
- Objetivo específico: ${diagnostico.objetivo_especifico || 'Não informado'}
- Meta 3 meses: ${diagnostico.meta_3_meses || 'Não informado'}
- Meta 12 meses: ${diagnostico.meta_12_meses || 'Não informado'}

**CONTEXTO:**
- Nível de IA: ${diagnostico.nivel_ia || 'Não informado'}
- Experiência com IA: ${diagnostico.experiencia_ia || 'Não informado'}
- Frequência de uso de IA: ${diagnostico.frequencia_uso_ia || 'Não informado'}
- Área de aplicação de IA: ${diagnostico.area_aplicacao_ia || 'Não informado'}
- Maior dificuldade com IA: ${diagnostico.maior_dificuldade_ia || 'Não informado'}

**DISPONIBILIDADE:**
- Tempo disponível: ${diagnostico.tempo_disponivel || 'Não informado'}
- Preferência de aprendizado: ${diagnostico.preferencia_aprendizado || 'Não informado'}
- Estilo de aprendizagem: ${diagnostico.estilo_aprendizagem || 'Não informado'}

Crie um plano estruturado com:

1. **objetivos_principais**: Array de 3-5 objetivos SMART baseados nas metas declaradas. Cada objetivo deve ter:
   - titulo: Nome claro e específico do objetivo
   - prazo_dias: Número de dias para completar (baseado em meta_3_meses = 90 dias, meta_12_meses = 365 dias)
   - observacoes: Breve descrição de como alcançar este objetivo

2. **quick_wins**: Array de 3-4 tarefas iniciais para começar imediatamente. Cada tarefa deve ter:
   - titulo: Nome da tarefa
   - descricao: Descrição detalhada do que fazer
   - prazo_dias: Número de dias (5-15 dias para quick wins)
   - tipo: Sempre "quick_win"
   - prioridade: Sempre "alta"

Responda APENAS com um JSON válido neste formato:
{
  "objetivos_principais": [
    {
      "titulo": "string",
      "prazo_dias": number,
      "observacoes": "string"
    }
  ],
  "quick_wins": [
    {
      "titulo": "string",
      "descricao": "string",
      "prazo_dias": number,
      "tipo": "quick_win",
      "prioridade": "alta"
    }
  ]
}
`;

    console.log('Chamando IA para gerar plano...');

    // Chamar IA para gerar objetivos
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na IA:', errorText);
      throw new Error(`Erro ao chamar IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const conteudo = aiData.choices[0].message.content;

    console.log('Resposta da IA:', conteudo);

    // Parse do JSON
    const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('IA não retornou JSON válido');
    }

    const plano = JSON.parse(jsonMatch[0]);

    console.log('Plano gerado:', plano);

    // Criar objetivos no banco
    const objetivosData = plano.objetivos_principais.map((obj: any) => {
      const prazo = new Date();
      prazo.setDate(prazo.getDate() + obj.prazo_dias);
      
      return {
        user_id: userId,
        objetivo: obj.titulo,
        prazo: prazo.toISOString().split('T')[0],
        status: 'em_andamento',
        progresso: 0,
        observacoes: obj.observacoes,
      };
    });

    const { data: objetivosCriados, error: objError } = await supabase
      .from('objetivos_mentoria')
      .insert(objetivosData)
      .select();

    if (objError) {
      console.error('Erro ao criar objetivos:', objError);
      throw objError;
    }

    console.log('Objetivos criados:', objetivosCriados);

    // Criar quick wins como tarefas
    const tarefasData = plano.quick_wins.map((task: any) => {
      const prazo = new Date();
      prazo.setDate(prazo.getDate() + task.prazo_dias);
      
      return {
        user_id: userId,
        titulo: task.titulo,
        descricao: task.descricao,
        tipo: 'quick_win',
        prioridade: 'alta',
        prazo_entrega: prazo.toISOString().split('T')[0],
        status: 'pendente',
      };
    });

    const { data: tarefasCriadas, error: taskError } = await supabase
      .from('tarefas_mentoria')
      .insert(tarefasData)
      .select();

    if (taskError) {
      console.error('Erro ao criar tarefas:', taskError);
      throw taskError;
    }

    console.log('Tarefas criadas:', tarefasCriadas);

    // Atualizar diagnóstico
    const { error: updateError } = await supabase
      .from('formulario_diagnostico')
      .update({
        plano_gerado: true,
        plano_gerado_em: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Erro ao atualizar diagnóstico:', updateError);
      throw updateError;
    }

    // Criar notificação para mentorado
    await supabase
      .from('notificacoes')
      .insert({
        user_id: userId,
        tipo: 'mentoria',
        titulo: '✨ Seu plano de mentoria foi criado!',
        mensagem: `${objetivosCriados?.length || 0} objetivos e ${tarefasCriadas?.length || 0} tarefas iniciais foram adicionados ao seu plano.`,
        link: '/mentoria/objetivos',
      });

    return new Response(
      JSON.stringify({
        success: true,
        objetivos: objetivosCriados,
        tarefas: tarefasCriadas,
        total_objetivos: objetivosCriados?.length || 0,
        total_tarefas: tarefasCriadas?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro em gerar-objetivos-diagnostico:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
