import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

1. **objetivos_principais**: Array de 3-6 objetivos estratégicos SMART. Cada objetivo deve ter:
   - titulo: Nome claro e específico do objetivo estratégico
   - prazo_dias: Número de dias para completar (90 para 3 meses, 365 para 12 meses)
   - observacoes: Breve descrição do impacto esperado

2. **projetos**: Array de 4-8 projetos/módulos que implementam os objetivos. Cada projeto deve ter:
   - titulo: Nome do projeto ou módulo
   - descricao: Descrição detalhada do que será desenvolvido
   - objetivo_projeto: O que este projeto entrega
   - contribuicao_plano: Como contribui para os objetivos gerais
   - objetivo_associado_index: Índice do objetivo em objetivos_principais (0-based)
   - prazo_dias: Dias para completar (15-90 dias)
   - status: "planejamento" para todos

3. **quick_wins**: Array de 2-4 tarefas iniciais para começar imediatamente. Cada tarefa deve ter:
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
  "projetos": [
    {
      "titulo": "string",
      "descricao": "string",
      "objetivo_projeto": "string",
      "contribuicao_plano": "string",
      "objetivo_associado_index": number,
      "prazo_dias": number,
      "status": "planejamento"
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

    // Criar projetos associados aos objetivos
    const projetosData = plano.projetos?.map((proj: any) => {
      const prazo = new Date();
      prazo.setDate(prazo.getDate() + proj.prazo_dias);
      
      // Associar ao objetivo correto baseado no índice
      const objetivoId = objetivosCriados?.[proj.objetivo_associado_index]?.id || null;
      
      return {
        user_id: userId,
        objetivo_id: objetivoId,
        titulo: proj.titulo,
        descricao: proj.descricao,
        objetivo_projeto: proj.objetivo_projeto,
        contribuicao_plano: proj.contribuicao_plano,
        status: proj.status || 'planejamento',
        data_entrega: prazo.toISOString().split('T')[0],
        trilhas_recomendadas: [],
        modulos_obrigatorios: [],
        progresso_preparacao: 0,
      };
    }) || [];

    let projetosCriados: any[] = [];
    if (projetosData.length > 0) {
      const { data: projData, error: projError } = await supabase
        .from('projetos_mentoria')
        .insert(projetosData)
        .select();

      if (projError) {
        console.error('Erro ao criar projetos:', projError);
        throw projError;
      }

      projetosCriados = projData || [];
      console.log('Projetos criados:', projetosCriados);
    }

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
        mensagem: `${objetivosCriados?.length || 0} objetivos, ${projetosCriados.length} projetos e ${tarefasCriadas?.length || 0} tarefas iniciais foram adicionados ao seu plano.`,
        link: '/mentoria/objetivos',
      });

    return new Response(
      JSON.stringify({
        success: true,
        objetivos: objetivosCriados,
        projetos: projetosCriados,
        tarefas: tarefasCriadas,
        total_objetivos: objetivosCriados?.length || 0,
        total_projetos: projetosCriados.length,
        total_tarefas: tarefasCriadas?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro em gerar-objetivos-diagnostico:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
