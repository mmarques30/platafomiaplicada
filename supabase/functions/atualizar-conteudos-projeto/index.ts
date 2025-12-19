import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projeto_id } = await req.json();

    if (!projeto_id) {
      return new Response(
        JSON.stringify({ error: "projeto_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar o projeto
    const { data: projeto, error: projetoError } = await supabaseClient
      .from("projetos_mentoria")
      .select("*")
      .eq("id", projeto_id)
      .single();

    if (projetoError || !projeto) {
      console.error("Erro ao buscar projeto:", projetoError);
      return new Response(
        JSON.stringify({ error: "Projeto não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar catálogo de trilhas
    const { data: trilhas, error: trilhasError } = await supabaseClient
      .from("trilhas")
      .select("id, titulo, categoria, ativo, descricao")
      .order("ordem");

    if (trilhasError) {
      console.error("Erro ao buscar trilhas:", trilhasError);
    }

    // Buscar catálogo de módulos
    const { data: modulos, error: modulosError } = await supabaseClient
      .from("modulos")
      .select("id, titulo, trilha_id, ativo, descricao, categoria")
      .order("ordem");

    if (modulosError) {
      console.error("Erro ao buscar módulos:", modulosError);
    }

    // Buscar vídeos para saber quais módulos têm conteúdo
    const { data: videos, error: videosError } = await supabaseClient
      .from("videos")
      .select("id, modulo_id, ativo")
      .eq("ativo", true);

    if (videosError) {
      console.error("Erro ao buscar vídeos:", videosError);
    }

    // Criar mapa de vídeos por módulo
    const videosPorModulo: Record<string, string[]> = {};
    if (videos) {
      for (const video of videos) {
        if (!videosPorModulo[video.modulo_id]) {
          videosPorModulo[video.modulo_id] = [];
        }
        videosPorModulo[video.modulo_id].push(video.id);
      }
    }

    // Montar catálogo para a IA
    const catalogoConteudo = `
CATÁLOGO DE CONTEÚDOS DA PLATAFORMA:

TRILHAS DISPONÍVEIS:
${(trilhas || []).map(t => `- "${t.titulo}" (Categoria: ${t.categoria}) [${t.ativo ? 'DISPONÍVEL' : 'EM BREVE'}] ID: ${t.id}
  Descrição: ${t.descricao || 'Sem descrição'}`).join('\n')}

MÓDULOS DISPONÍVEIS:
${(modulos || []).map(m => {
  const trilha = trilhas?.find(t => t.id === m.trilha_id);
  const temVideos = videosPorModulo[m.id]?.length > 0;
  return `- "${m.titulo}" (Trilha: ${trilha?.titulo || 'N/A'}, Categoria: ${m.categoria}) [${m.ativo && temVideos ? 'DISPONÍVEL' : 'EM BREVE'}] ID: ${m.id}
  Descrição: ${m.descricao || 'Sem descrição'}`;
}).join('\n')}
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um especialista em educação e IA que analisa projetos de mentoria e recomenda conteúdos de preparação.

Sua tarefa é analisar o projeto fornecido e recomendar trilhas e módulos do catálogo que ajudem o mentorado a se preparar para executar o projeto.

REGRAS IMPORTANTES:
1. Use APENAS IDs que existem no catálogo fornecido
2. Recomende 1-3 trilhas mais relevantes para o projeto
3. Recomende 2-5 módulos mais relevantes para o projeto
4. Se o conteúdo está marcado como "DISPONÍVEL", use status "disponivel"
5. Se o conteúdo está marcado como "EM BREVE", use status "em_breve"
6. Prioridade pode ser: "essencial", "recomendada" ou "complementar"

${catalogoConteudo}

Responda APENAS com um JSON válido no seguinte formato:
{
  "trilhas_recomendadas": [
    {
      "trilha_id": "uuid-da-trilha",
      "titulo": "Nome da Trilha",
      "prioridade": "essencial|recomendada|complementar",
      "status": "disponivel|em_breve"
    }
  ],
  "modulos_obrigatorios": [
    {
      "modulo_id": "uuid-do-modulo",
      "titulo": "Nome do Módulo",
      "trilha_id": "uuid-da-trilha-do-modulo",
      "trilha_titulo": "Nome da Trilha",
      "status": "disponivel|em_breve",
      "video_ids": ["uuid-video-1", "uuid-video-2"]
    }
  ]
}`;

    const userPrompt = `Analise este projeto e recomende conteúdos de preparação:

PROJETO:
- Título: ${projeto.titulo}
- Descrição: ${projeto.descricao || 'Sem descrição'}
- Objetivo: ${projeto.objetivo_projeto || 'Não especificado'}
- Tipo: ${projeto.tipo || 'operacional'}
- Status: ${projeto.status}

Recomende trilhas e módulos do catálogo que ajudem o mentorado a se preparar para este projeto.`;

    console.log("Enviando para IA...");

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API de IA:", response.status, errorText);
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Resposta vazia da IA");
    }

    console.log("Resposta da IA:", aiContent);

    // Extrair JSON da resposta
    let recomendacoes;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recomendacoes = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta");
      }
    } catch (parseError) {
      console.error("Erro ao parsear resposta da IA:", parseError);
      throw new Error("Erro ao processar resposta da IA");
    }

    // Adicionar video_ids aos módulos
    if (recomendacoes.modulos_obrigatorios) {
      for (const modulo of recomendacoes.modulos_obrigatorios) {
        modulo.video_ids = videosPorModulo[modulo.modulo_id] || [];
      }
    }

    // Atualizar o projeto com as recomendações
    const { error: updateError } = await supabaseClient
      .from("projetos_mentoria")
      .update({
        trilhas_recomendadas: recomendacoes.trilhas_recomendadas || [],
        modulos_obrigatorios: recomendacoes.modulos_obrigatorios || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", projeto_id);

    if (updateError) {
      console.error("Erro ao atualizar projeto:", updateError);
      throw new Error("Erro ao salvar recomendações");
    }

    console.log("Projeto atualizado com sucesso:", projeto_id);

    return new Response(
      JSON.stringify({
        success: true,
        trilhas_recomendadas: recomendacoes.trilhas_recomendadas?.length || 0,
        modulos_obrigatorios: recomendacoes.modulos_obrigatorios?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na função atualizar-conteudos-projeto:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
