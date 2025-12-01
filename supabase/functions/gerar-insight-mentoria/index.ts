import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um mentor especialista em IA aplicada ao trabalho. 
Analise o formulário diagnóstico e gere um insight personalizado completo com:

1. **Análise do Perfil**: Resumo do estágio atual do mentorado (2-3 frases)
2. **Principais Oportunidades**: 3 áreas onde IA pode gerar mais impacto no contexto dele
3. **Primeiros Passos**: 3 ações práticas e específicas para começar imediatamente
4. **Alerta de Desafios**: Possíveis obstáculos baseados no contexto dele
5. **Recomendação de Foco**: Prioridade estratégica para os próximos 30 dias
6. **Objetivos Estratégicos**: 3-5 objetivos divididos em curto_prazo, medio_prazo e longo_prazo
7. **Projetos Sugeridos**: 2-3 projetos práticos com título, descrição, objetivo e contribuição ao plano

Seja direto, prático e encorajador. Use dados específicos do formulário.
Responda APENAS com JSON válido neste formato exato:
{
  "analise_perfil": "texto aqui",
  "oportunidades": ["op1", "op2", "op3"],
  "primeiros_passos": ["passo1", "passo2", "passo3"],
  "alerta_desafios": "texto aqui",
  "recomendacao_foco": "texto aqui",
  "objetivos": [
    {"objetivo": "texto", "tipo": "curto_prazo", "prioridade": 1},
    {"objetivo": "texto", "tipo": "medio_prazo", "prioridade": 2}
  ],
  "projetos": [
    {
      "titulo": "título do projeto",
      "descricao": "descrição breve",
      "objetivo_projeto": "o que alcançar",
      "contribuicao_plano": "como contribui"
    }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formulario_id } = await req.json();
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Usuário não encontrado");

    // Buscar formulário
    const { data: formulario, error } = await supabaseClient
      .from("formulario_diagnostico")
      .select("*")
      .eq("id", formulario_id)
      .eq("user_id", user.id)
      .single();

    if (error || !formulario) {
      console.error("Erro ao buscar formulário:", error);
      throw new Error("Formulário não encontrado");
    }

    // Preparar contexto detalhado para IA
    const contexto = `
FORMULÁRIO DIAGNÓSTICO COMPLETO:

INFORMAÇÕES PESSOAIS:
- Nome: ${formulario.nome_completo || "Não informado"}
- Profissão: ${formulario.profissao || "Não informado"}
- Área de atuação: ${formulario.area_atuacao || "Não informado"}
- Tempo de experiência: ${formulario.tempo_experiencia || "Não informado"}
- Tamanho da empresa: ${formulario.tamanho_empresa || "Não informado"}
- Lidera equipe: ${formulario.lidera_equipe ? `Sim (${formulario.tamanho_equipe} pessoas)` : "Não"}

EXPERIÊNCIA COM IA:
- Nível atual: ${formulario.nivel_ia || "Não informado"}
- Ferramentas que usa: ${Array.isArray(formulario.ferramentas_ia) ? formulario.ferramentas_ia.join(", ") : "Nenhuma"}
- Frequência de uso: ${formulario.frequencia_uso_ia || "Não informado"}
- Maior dificuldade: ${formulario.maior_dificuldade_ia || "Não informado"}

OBJETIVOS:
- Objetivo principal: ${formulario.objetivo_principal || "Não informado"}
- Meta 3 meses: ${formulario.meta_3_meses || "Não informado"}
- Meta 12 meses: ${formulario.meta_12_meses || "Não informado"}
- Área de aplicação: ${formulario.area_aplicacao_ia || "Não informado"}

DESAFIOS ATUAIS:
1. ${formulario.desafio_1 || "Não informado"}
2. ${formulario.desafio_2 || "Não informado"}
3. ${formulario.desafio_3 || "Não informado"}

CONTEXTO E DISPONIBILIDADE:
- Tempo disponível: ${formulario.tempo_disponivel || "Não informado"}
- Maior ladrão de tempo: ${formulario.maior_ladrao_tempo || "Não informado"}
- Nível de autonomia: ${formulario.nivel_autonomia || "Não informado"}

APRENDIZAGEM:
- Estilo de aprendizagem: ${formulario.estilo_aprendizagem || "Não informado"}
- Preferência: ${formulario.preferencia_aprendizado || "Não informado"}
- Melhor horário: ${formulario.melhor_horario || "Não informado"}

MOTIVAÇÃO:
- Nível de comprometimento: ${formulario.nivel_comprometimento || "Não informado"}/10
- Motivação para mentoria: ${formulario.motivacao_mentoria || "Não informado"}
- Maior medo com IA: ${formulario.maior_medo_ia || "Não informado"}

EXPECTATIVAS:
- Tipo de suporte: ${formulario.tipo_suporte || "Não informado"}
- O que seria uma vitória em 30 dias: ${formulario.vitoria_30_dias || "Não informado"}
    `.trim();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Gerando insight para formulário:", formulario_id);

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
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API de IA:", response.status, errorText);
      throw new Error("Erro ao gerar insight com IA");
    }

    const aiData = await response.json();
    const insightText = aiData.choices[0].message.content;
    
    console.log("Resposta da IA:", insightText);
    
    const insight = JSON.parse(insightText);

    // Salvar insight no banco
    const { error: updateError } = await supabaseClient
      .from("formulario_diagnostico")
      .update({ 
        insight_ia: insight,
        insight_gerado_em: new Date().toISOString(),
        plano_gerado: true,
        plano_gerado_em: new Date().toISOString(),
        plano_gerado_por: user.id
      })
      .eq("id", formulario_id);

    if (updateError) {
      console.error("Erro ao salvar insight:", updateError);
      throw updateError;
    }

    console.log("Insight salvo com sucesso");

    // Salvar objetivos gerados
    if (insight.objetivos && Array.isArray(insight.objetivos)) {
      for (const obj of insight.objetivos) {
        const { error: objError } = await supabaseClient
          .from("objetivos_mentoria")
          .insert({
            user_id: user.id,
            formulario_id: formulario_id,
            objetivo: obj.objetivo,
            tipo: obj.tipo,
            prioridade: obj.prioridade,
            status: "ativo",
            gerado_por_ia: true
          });
        
        if (objError) {
          console.error("Erro ao salvar objetivo:", objError);
        }
      }
      console.log("Objetivos salvos com sucesso");
    }

    // Salvar projetos sugeridos
    if (insight.projetos && Array.isArray(insight.projetos)) {
      for (const proj of insight.projetos) {
        const { error: projError } = await supabaseClient
          .from("projetos_mentoria")
          .insert({
            user_id: user.id,
            titulo: proj.titulo,
            descricao: proj.descricao,
            objetivo_projeto: proj.objetivo_projeto,
            contribuicao_plano: proj.contribuicao_plano,
            status: "planejamento",
            tipo: "operacional"
          });
        
        if (projError) {
          console.error("Erro ao salvar projeto:", projError);
        }
      }
      console.log("Projetos salvos com sucesso");
    }

    // Registrar auditoria
    await supabaseClient
      .from("auditoria_conteudo")
      .insert({
        tabela: "formulario_diagnostico",
        registro_id: formulario_id,
        operacao: "UPDATE",
        user_id: user.id,
        dados_novos: {
          plano_gerado: true,
          objetivos_count: insight.objetivos?.length || 0,
          projetos_count: insight.projetos?.length || 0
        }
      });

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
