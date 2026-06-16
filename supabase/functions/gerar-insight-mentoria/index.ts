import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const buildSystemPrompt = (catalogoConteudo: string, catalogoFerramentas: string) => `Você é um mentor especialista em IA aplicada ao trabalho. 
Analise o formulário diagnóstico e gere um insight personalizado completo com ETAPAS DE EVOLUÇÃO claras.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA:

1. **Etapas de Evolução**: Crie 4-5 etapas progressivas de desenvolvimento. Cada etapa deve ter:
   - numero: número sequencial (1, 2, 3...)
   - titulo: nome da etapa (ex: "Fundamentos de IA Generativa")
   - objetivo: o que a pessoa vai aprender/conquistar nesta etapa (1-2 frases)
   - duracao_estimada: tempo estimado (ex: "2 semanas", "1 mês")
   - ferramentas: 2-3 ferramentas para dominar nesta etapa, cada uma com:
     - nome: nome da ferramenta
     - foco: como usar/o que aprender com ela
   - trilhas_recomendadas: 2-3 trilhas do catálogo para estudar, cada uma com:
     - trilha_id: ID da trilha
     - titulo: nome da trilha
   - entregavel: o que a pessoa deve entregar/alcançar ao final da etapa

2. **Análise do Perfil**: Resumo do estágio atual do mentorado (2-3 frases)
3. **Principais Oportunidades**: 3 áreas onde IA pode gerar mais impacto
4. **Primeiros Passos**: 3 ações práticas para começar imediatamente
5. **Alerta de Desafios**: Possíveis obstáculos baseados no contexto
6. **Recomendação de Foco**: Prioridade estratégica para os próximos 30 dias
7. **Ferramentas Prioritárias**: 3-5 ferramentas de IA que o mentorado DEVE dominar
8. **Objetivos Estratégicos**: 3-5 objetivos divididos em curto_prazo, medio_prazo e longo_prazo
9. **Projetos Sugeridos**: 2-3 projetos práticos com trilhas, módulos e ferramentas específicas

${catalogoConteudo}

${catalogoFerramentas}

IMPORTANTE SOBRE AS ETAPAS:
- As etapas devem ser PROGRESSIVAS, do básico ao avançado
- Cada etapa deve construir sobre a anterior
- Seja específico sobre as ferramentas e trilhas em cada etapa
- O entregável deve ser concreto e mensurável

IMPORTANTE SOBRE FERRAMENTAS:
- Selecione ferramentas do catálogo acima que são ESSENCIAIS para o perfil do mentorado
- Para cada projeto, indique 2-3 ferramentas específicas que serão usadas
- Justifique brevemente por que cada ferramenta é importante
- Use os nomes exatos das ferramentas do catálogo

IMPORTANTE SOBRE RECOMENDAÇÕES DE CONTEÚDO:
- Para cada etapa e projeto, selecione trilhas e módulos do catálogo acima
- Use os IDs exatos das trilhas e módulos do catálogo
- Se uma trilha ou módulo não está ativo, inclua com status "em_breve"
- Prioridades: "essencial" (obrigatório), "recomendada" (importante), "complementar" (opcional)

Seja direto, prático e encorajador. Use dados específicos do formulário.
Responda APENAS com JSON válido neste formato exato:
{
  "etapas_evolucao": [
    {
      "numero": 1,
      "titulo": "Fundamentos de IA Generativa",
      "objetivo": "Entender os conceitos básicos e experimentar as primeiras ferramentas",
      "duracao_estimada": "2 semanas",
      "ferramentas": [
        {"nome": "ChatGPT", "foco": "Aprenda a criar prompts eficientes para diferentes contextos"}
      ],
      "trilhas_recomendadas": [
        {"trilha_id": "uuid-da-trilha", "titulo": "Nome da Trilha"}
      ],
      "entregavel": "Criar 3 prompts otimizados para sua área de atuação"
    }
  ],
  "analise_perfil": "texto aqui",
  "oportunidades": ["op1", "op2", "op3"],
  "primeiros_passos": ["passo1", "passo2", "passo3"],
  "alerta_desafios": "texto aqui",
  "recomendacao_foco": "texto aqui",
  "ferramentas_prioritarias": [
    {
      "nome": "ChatGPT",
      "categoria": "LLM Conversacional",
      "motivo": "Por que é essencial para este perfil",
      "nivel_prioridade": 1,
      "gratuito": false
    }
  ],
  "objetivos": [
    {"objetivo": "texto", "tipo": "curto_prazo", "prioridade": 1},
    {"objetivo": "texto", "tipo": "medio_prazo", "prioridade": 2}
  ],
  "projetos": [
    {
      "titulo": "título do projeto",
      "descricao": "descrição breve",
      "objetivo_projeto": "o que alcançar",
      "contribuicao_plano": "como contribui",
      "ferramentas_projeto": [
        {
          "nome": "ChatGPT",
          "uso_no_projeto": "Como será usado especificamente neste projeto"
        }
      ],
      "trilhas_recomendadas": [
        {"trilha_id": "uuid-da-trilha", "titulo": "Nome da Trilha", "prioridade": "essencial", "status": "disponivel"}
      ],
      "modulos_obrigatorios": [
        {"modulo_id": "uuid-do-modulo", "titulo": "Nome do Módulo", "trilha_id": "uuid-da-trilha", "trilha_titulo": "Nome da Trilha", "status": "disponivel"}
      ]
    }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { formulario_id, sessao_id, user_id: target_user_id, etapa_atual, contexto: sessaoContexto } = body;
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // ===== CODE PATH: SESSÃO DE MENTORIA =====
    if (sessao_id) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

      // Buscar sessão usando service role para acesso admin
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: sessao, error: sessaoError } = await serviceClient
        .from("sessoes_mentoria")
        .select("*")
        .eq("id", sessao_id)
        .single();

      if (sessaoError || !sessao) {
        console.error("Erro ao buscar sessão:", sessaoError);
        throw new Error("Sessão não encontrada");
      }

      // Buscar perfil do mentorado
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("nome_completo, email, plano_mentoria")
        .eq("id", sessao.user_id)
        .single();

      const promptSessao = `Você é um mentor especialista em IA aplicada ao trabalho.
Gere um RESUMO EXECUTIVO conciso da sessão de mentoria com:

1. **Pontos-chave**: 3-4 tópicos principais abordados
2. **Próximos passos**: 2-3 ações concretas para o mentorado
3. **Recomendações**: 1-2 sugestões estratégicas

Seja direto, prático e encorajador. Responda em texto corrido (não JSON).`;

      const contextoSessao = `
SESSÃO DE MENTORIA:
- Título: ${sessao.titulo}
- Data: ${sessaoContexto || sessao.data_sessao}
- Etapa: ${etapa_atual || 'Não definida'}
- Mentorado: ${profile?.nome_completo || 'Não identificado'}
- Plano: ${profile?.plano_mentoria || 'Não definido'}
- Notas da sessão: ${sessao.notas || 'Sem notas'}
- Transcrição: ${sessao.transcricao ? sessao.transcricao.substring(0, 2000) : 'Sem transcrição'}
`.trim();

      console.log("Gerando insight para sessão:", sessao_id);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: promptSessao },
            { role: "user", content: contextoSessao }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro da API de IA:", response.status, errorText);
        throw new Error("Erro ao gerar insight com IA");
      }

      const aiData = await response.json();
      const insightText = aiData.choices[0].message.content;

      // Salvar insight na sessão
      const { error: updateError } = await serviceClient
        .from("sessoes_mentoria")
        .update({ insight_resumo: insightText })
        .eq("id", sessao_id);

      if (updateError) {
        console.error("Erro ao salvar insight da sessão:", updateError);
        throw updateError;
      }

      console.log("Insight da sessão salvo com sucesso");

      return new Response(
        JSON.stringify({ insight: insightText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== CODE PATH: FORMULÁRIO DIAGNÓSTICO (original) =====

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Usuário não encontrado");

    // Service client bypassa RLS — necessário porque a busca pelo id
    // do formulário (sem filtro user_id) continuava sendo bloqueada pela
    // policy, mesmo quando o caller era admin. ANTES: o "select pelo id"
    // foi feito com cliente autenticado e voltava vazio → "Formulário
    // não encontrado" (motivo do bug reportado pela Mari pra Ariane).
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: formulario, error } = await serviceClient
      .from("formulario_diagnostico")
      .select("*")
      .eq("id", formulario_id)
      .maybeSingle();

    if (error || !formulario) {
      console.error("Erro ao buscar formulário:", error);
      throw new Error("Formulário não encontrado");
    }

    // Permissão: dono do formulário OU admin/equipe. Continua usando o
    // cliente autenticado pra checar a role real do caller (não bypass).
    const isOwner = formulario.user_id === user.id;
    let isAdmin = false;
    if (!isOwner) {
      const { data: roleRow } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "equipe"])
        .maybeSingle();
      isAdmin = !!roleRow;
    }
    if (!isOwner && !isAdmin) {
      throw new Error("Sem permissão para gerar insight deste formulário");
    }

    // user_id efetivo do MENTORADO (dono do formulário) — usado em todos
    // os inserts pra que os objetivos/projetos apareçam pra ele.
    const menteeUserId: string = formulario.user_id;

    // Buscar catálogo de conteúdos (trilhas e módulos)
    console.log("Buscando catálogo de conteúdos...");
    
    const { data: trilhas, error: trilhasError } = await supabaseClient
      .from("trilhas")
      .select("id, titulo, categoria, ativo, descricao, nivel")
      .order("ordem");
    
    if (trilhasError) {
      console.error("Erro ao buscar trilhas:", trilhasError);
    }

    const { data: modulos, error: modulosError } = await supabaseClient
      .from("modulos")
      .select("id, titulo, trilha_id, ativo, descricao, categoria")
      .order("ordem");
    
    if (modulosError) {
      console.error("Erro ao buscar módulos:", modulosError);
    }

    // Buscar ferramentas de IA disponíveis
    const { data: ferramentas, error: ferramentasError } = await supabaseClient
      .from("ferramentas_ia")
      .select("id, nome, categoria, objetivo, o_que_entrega, gratuito, vale_a_pena, avaliacao_mari")
      .eq("ativo", true)
      .order("avaliacao_mari", { ascending: false });
    
    if (ferramentasError) {
      console.error("Erro ao buscar ferramentas:", ferramentasError);
    }

    // Montar catálogo para a IA
    const trilhasFormatadas = (trilhas || []).map(t => 
      `- "${t.titulo}" (${t.categoria}${t.nivel ? `, ${t.nivel}` : ''}) [${t.ativo ? 'DISPONÍVEL' : 'EM BREVE'}] ID: ${t.id}${t.descricao ? ` - ${t.descricao}` : ''}`
    ).join('\n');

    // Agrupar módulos por trilha
    const modulosPorTrilha: Record<string, any[]> = {};
    (modulos || []).forEach(m => {
      if (!modulosPorTrilha[m.trilha_id]) {
        modulosPorTrilha[m.trilha_id] = [];
      }
      modulosPorTrilha[m.trilha_id].push(m);
    });

    const modulosFormatados = (trilhas || []).map(t => {
      const modulosDaTrilha = modulosPorTrilha[t.id] || [];
      if (modulosDaTrilha.length === 0) return null;
      
      return `\nTrilha "${t.titulo}":\n${modulosDaTrilha.map(m => 
        `  - "${m.titulo}" [${m.ativo ? 'DISPONÍVEL' : 'EM BREVE'}] ID: ${m.id}`
      ).join('\n')}`;
    }).filter(Boolean).join('\n');

    const catalogoConteudo = `
CATÁLOGO DE CONTEÚDOS DA PLATAFORMA:

TRILHAS DISPONÍVEIS:
${trilhasFormatadas || 'Nenhuma trilha cadastrada'}

MÓDULOS POR TRILHA:
${modulosFormatados || 'Nenhum módulo cadastrado'}
`;

    // Montar catálogo de ferramentas
    const ferramentasFormatadas = (ferramentas || []).map(f => 
      `- "${f.nome}" (${f.categoria}) - ${f.objetivo}. ${f.o_que_entrega}. [${f.gratuito ? 'GRATUITO' : 'PAGO'}]${f.vale_a_pena ? ' ⭐ Recomendado' : ''}`
    ).join('\n');

    const catalogoFerramentas = `
CATÁLOGO DE FERRAMENTAS DE IA:

${ferramentasFormatadas || 'Nenhuma ferramenta cadastrada'}
`;

    console.log("Catálogo de conteúdos montado:", catalogoConteudo.substring(0, 500) + "...");
    console.log("Catálogo de ferramentas montado:", catalogoFerramentas.substring(0, 500) + "...");

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

COMPROMETIMENTO:
- Nível de comprometimento: ${formulario.nivel_comprometimento || "Não informado"}/10
- Maior medo com IA: ${formulario.maior_medo_ia || "Não informado"}
- Zona de conforto: ${formulario.zona_conforto || "Não informado"}

PRIORIDADES:
- O que seria uma vitória em 30 dias: ${formulario.vitoria_30_dias || "Não informado"}
- Quick wins desejados: ${Array.isArray(formulario.quick_wins) ? formulario.quick_wins.join(", ") : "Não informado"}
    `.trim();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Gerando insight para formulário:", formulario_id);

    const systemPrompt = buildSystemPrompt(catalogoConteudo, catalogoFerramentas);

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

    // Salvar insight no banco. Service role: o admin não é dono do
    // formulário e o RLS bloquearia o UPDATE pelo cliente autenticado.
    const { error: updateError } = await serviceClient
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

    // Idempotência: se a função roda 2x (ex: cliente refinalizou, admin
    // usou "Forçar finalização" depois), evita duplicar objetivos/projetos
    // gerados anteriormente por IA. Remove os antigos antes de inserir os novos.
    // Service role pelo mesmo motivo: admin não é dono → RLS bloqueia.
    await serviceClient
      .from("objetivos_mentoria")
      .delete()
      .eq("user_id", menteeUserId)
      .eq("formulario_id", formulario_id)
      .eq("gerado_por_ia", true);
    await serviceClient
      .from("projetos_mentoria")
      .delete()
      .eq("user_id", menteeUserId)
      .eq("tipo", "operacional");

    // Salvar objetivos gerados. Filtra entradas vazias da IA (form parcial
    // pode resultar em objetos sem `objetivo`/`tipo`) pra não violar
    // colunas NOT NULL.
    if (insight.objetivos && Array.isArray(insight.objetivos)) {
      for (const obj of insight.objetivos) {
        if (!obj?.objetivo || !obj?.tipo) {
          console.warn("Pulando objetivo inválido:", obj);
          continue;
        }
        const { error: objError } = await serviceClient
          .from("objetivos_mentoria")
          .insert({
            user_id: menteeUserId,
            formulario_id: formulario_id,
            objetivo: obj.objetivo,
            tipo: obj.tipo,
            prioridade: obj.prioridade ?? "media",
            status: "ativo",
            gerado_por_ia: true
          });
        
        if (objError) {
          console.error("Erro ao salvar objetivo:", objError);
        }
      }
      console.log("Objetivos salvos com sucesso");
    }

    // Salvar projetos sugeridos com trilhas, módulos e ferramentas
    if (insight.projetos && Array.isArray(insight.projetos)) {
      for (const proj of insight.projetos) {
        if (!proj?.titulo) {
          console.warn("Pulando projeto sem título:", proj);
          continue;
        }
        // Processar trilhas recomendadas - adicionar video_ids para cada módulo
        const modulosComVideos = await Promise.all(
          (proj.modulos_obrigatorios || []).map(async (modulo: any) => {
            // Buscar vídeos do módulo
            const { data: videos } = await serviceClient
              .from("videos")
              .select("id")
              .eq("modulo_id", modulo.modulo_id)
              .eq("ativo", true)
              .order("ordem");

            return {
              ...modulo,
              video_ids: videos?.map(v => v.id) || []
            };
          })
        );

        const { error: projError } = await serviceClient
          .from("projetos_mentoria")
          .insert({
            user_id: menteeUserId,
            titulo: proj.titulo,
            descricao: proj.descricao ?? "",
            objetivo_projeto: proj.objetivo_projeto ?? null,
            contribuicao_plano: proj.contribuicao_plano ?? null,
            status: "planejamento",
            tipo: "operacional",
            trilhas_recomendadas: proj.trilhas_recomendadas || [],
            modulos_obrigatorios: modulosComVideos,
            ferramentas_projeto: proj.ferramentas_projeto || [],
            progresso_preparacao: 0
          });

        if (projError) {
          console.error("Erro ao salvar projeto:", projError);
        }
      }
      console.log("Projetos salvos com sucesso");
    }

    // Registrar auditoria
    await serviceClient
      .from("auditoria_conteudo")
      .insert({
        tabela: "formulario_diagnostico",
        registro_id: formulario_id,
        operacao: "UPDATE",
        user_id: user.id,
        dados_novos: {
          plano_gerado: true,
          objetivos_count: insight.objetivos?.length || 0,
          projetos_count: insight.projetos?.length || 0,
          ferramentas_count: insight.ferramentas_prioritarias?.length || 0,
          etapas_count: insight.etapas_evolucao?.length || 0
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