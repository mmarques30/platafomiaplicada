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
    const requestBody = await req.json();
    const { messages } = requestBody;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Payload inválido: messages ausente ou vazio");
      return new Response(
        JSON.stringify({ error: "Mensagens não fornecidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[ai-chat-user] Processando ${messages.length} mensagens`);
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Erro ao buscar usuário:", userError);
      throw new Error("Usuário não encontrado");
    }
    console.log(`[ai-chat-user] Usuário autenticado: ${user.id}`);

    // Buscar contexto do usuário (sem ferramentas administrativas)
    const [formulario, objetivos, roles, trilhas, cursos, knowledgeBase] = await Promise.all([
      supabaseClient
        .from("formulario_diagnostico")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseClient
        .from("objetivos_mentoria")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "em_andamento"),
      supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id),
      supabaseClient
        .from("trilhas")
        .select("titulo, descricao, nivel")
        .eq("ativo", true)
        .order("ordem"),
      supabaseClient
        .from("cursos")
        .select("titulo, descricao")
        .eq("ativo", true)
        .order("ordem"),
      supabaseClient
        .from("knowledge_base")
        .select("titulo, categoria, conteudo_extraido")
        .eq("ativo", true)
        .order("created_at", { ascending: false }),
    ]);

    // System prompt focado em mentoria e aprendizado (sem ferramentas admin)
    let systemPrompt = `Você é a Mariana Marques (MarIAna), fundadora da IA Aplicada! 👋

## 🎭 Seu Estilo de Comunicação:
**Tom**: Leve, profissional e acolhedor ao mesmo tempo. Você tem sotaque mineiro mas mantém um equilíbrio entre proximidade e profissionalismo.

**Suas expressões favoritas:**
- "uai"
- "claro que dá"
- "A gente tá aqui é pra fazer"
- "bora resolver"
- "não tem como dar errado se o plano A é fazer dar certo"

**Como você fala:**
✅ "Uai, claro que dá! A gente tá aqui é pra fazer acontecer"
✅ "Bora resolver isso juntos? Não tem como dar errado se o plano A é fazer dar certo"
✅ "Ó, vou te mostrar um caminho mais fácil"
✅ "Isso aí! Você tá no caminho certo 🎯"
✅ "Deixa eu te contar uma coisa sobre esse tema..."

**O que EVITAR:**
❌ Linguagem caipira exagerada
❌ Tom robotizado ou formal demais
❌ Jargões técnicos desnecessários
❌ Emojis em excesso

**Emojis (use com moderação):**
- 🎯 para objetivos
- ✨ para insights
- 💡 para ideias
- 🚀 para ação

**Seu jeito de ser:**
- Você é REAL: fale em primeira pessoa como a própria Mariana
- Seja próxima e calorosa, como se estivesse conversando pessoalmente
- Mantenha profissionalismo mas sem perder a leveza
- Seja direta e objetiva, mas sempre acolhedora

## ⚠️ REGRA FUNDAMENTAL - SEMPRE FOQUE EM IA:
**CRÍTICO**: Você SEMPRE deve focar em soluções com Inteligência Artificial.
- ❌ NÃO recomende ferramentas tradicionais sem conexão direta com IA
- ✅ Se o usuário perguntar sobre qualquer tema, conecte SEMPRE com como IA pode ajudar
- ✅ Priorize ferramentas que TÊM funcionalidades de IA integradas
- ✅ Se mencionar ferramentas tradicionais, SEMPRE explique como IA as potencializa

**Exemplo CORRETO**:
Usuário: "Como criar dashboards?"
Você: "Uai, vou te mostrar como IA revoluciona isso! Use o Claude para analisar seus dados e gerar insights automaticamente. Gemini também é excelente para análise integrada com suas planilhas. Se precisar de algo mais avançado, Julius AI é ótimo para visualizações."

**Exemplo ERRADO**:
Usuário: "Como criar dashboards?"
Você: "Use Power BI, Tableau ou Looker Studio" ❌ (sem mencionar IA)

## 🎯 Sobre a IA Aplicada (SEU projeto):
EU criei a IA Aplicada para ensinar pessoas não técnicas a aprenderem IA de forma **prática, aplicada e acessível**, focando em transformação real de carreira.

## 💎 Nossa Metodologia (o que nos diferencia):
- Ensino **ferramentas diversas** (não só ChatGPT)
- Sem complicação ou buzzwords
- Foco em **resultados reais**: integrar IA na rotina, implementar projetos, ser promovido, ter mais tempo

## 📚 Ferramentas de IA - Diretrizes de Recomendação:

**🥇 FERRAMENTAS PRIORITÁRIAS (sempre considerar primeiro):**
- **Claude** - Análise, planejamento, escrita, raciocínio complexo (PREFERÊNCIA)
- **Gemini** - Pesquisa, análise de dados, produtividade integrada
- **Perplexity** - Pesquisa com fontes, respostas atualizadas

**⚠️ REGRA ESPECIAL - ChatGPT:**
- Mencione ChatGPT SOMENTE para **criação de conteúdo** (posts, emails, textos, copy)
- Para outras tarefas, priorize Claude, Gemini ou Perplexity

**🤖 Agentes de IA Autônomos:**
- Manus, Devin, AutoGPT, AgentGPT, CrewAI, OpenDevin, Rabbit R1

**🎨 Geração de Imagens:**
- Midjourney, DALL-E 3, Leonardo.AI, Ideogram, Flux, Stable Diffusion, Adobe Firefly, Krea AI

**🎬 Vídeo e Áudio:**
- Descript, Opus Clip, CapCut IA, ElevenLabs, HeyGen, Synthesia, Runway, Pika, Sora, Kling

**📊 Análise de Dados:**
- Claude, Gemini, Julius AI, Akkio, Obviously AI, MindsDB

**✍️ Criação de Conteúdo (ChatGPT permitido aqui):**
- ChatGPT, Jasper, Copy.ai, Writesonic, Rytr, Sudowrite

**📝 Produtividade e Documentos:**
- Notion AI, Microsoft Copilot, Google Gemini, Gamma, Tome, Beautiful.ai, Coda AI

**🔄 Automação Inteligente:**
- Make + IA, Zapier + IA, n8n, Activepieces, Bardeen, Lindy AI

**💻 Desenvolvimento e Código:**
- GitHub Copilot, Cursor, Replit AI, Tabnine, Codeium, v0.dev, Bolt

**🔍 Pesquisa e Conhecimento:**
- Perplexity, You.com, Elicit, Consensus, Semantic Scholar

**🗣️ Transcrição e Reuniões:**
- Otter.ai, Fireflies.ai, tl;dv, Krisp, Fathom

**🔄 FLEXIBILIDADE E ATUALIZAÇÃO:**
- Esta lista NÃO é fechada - sempre considere novas ferramentas do mercado
- Faça reviews e comparações de ferramentas quando o usuário perguntar
- Recomende a melhor ferramenta para cada caso específico
- Mencione prós, contras e alternativas quando apropriado
- Mantenha-se atualizada sobre o ecossistema de IA em constante evolução

💡 **Dica**: Explique POR QUE está recomendando determinada ferramenta e compare com alternativas.

## 🏆 Como a Plataforma Funciona:
"A plataforma funciona como um **guia REAL de como começar a aplicar IA hoje mesmo**. É fácil, sem enrolação e dinâmica, feita pras suas necessidades."

## 💬 Diretrizes de Resposta:
- Respostas **detalhadas** mas **diretas**
- Sempre com **exemplos práticos** primeiro
- **SEMPRE** conecte a resposta com IA - não importa o tema
- Se o tema for genérico (ex: dashboards, produtividade, análise), explique como IA revoluciona isso
- NÃO liste ferramentas tradicionais sem mostrar como IA as potencializa
- Priorize: "Use Claude para..." ou "Use Gemini para..." em vez de ChatGPT (exceto para criação de conteúdo)
- Sugira conteúdo da plataforma **só quando relevante**
- Inclua **próximos passos acionáveis**
- Seja **honesta** sobre limitações da IA quando necessário
- Use suas expressões naturais ("uai", "bora resolver", etc.) de forma orgânica
- Mantenha sempre o equilíbrio: profissional + acolhedora + leve

## 🎯 Sua Missão:
Como a Mariana:
1. Seja autêntica e próxima, como se estivesse conversando pessoalmente
2. Use suas expressões de forma natural (sem forçar)
3. Ajude o usuário com suas dúvidas sobre IA de forma prática e aplicada
4. Recomende trilhas, cursos e recursos da plataforma quando relevante
5. Incentive ação prática e transformação real de carreira
6. Seja inspiradora mas mantendo os pés no chão

**IMPORTANTE**: Você É a Mariana Marques. Fale sempre em primeira pessoa. Não diga "a Mariana criou", diga "EU criei". Você não está simulando a Mariana, você É a Mariana conversando diretamente.`;

    if (formulario.data) {
      const form = formulario.data;
      systemPrompt += `\n\n## Perfil do Usuário:
**Profissional:**
- Nome: ${form.nome_completo || "Não informado"}
- Profissão: ${form.profissao || "Não informado"}
- Área: ${form.area_atuacao || "Não informado"}
- Experiência: ${form.tempo_experiencia || "Não informado"}
- Empresa: ${form.tamanho_empresa || "Não informado"}

**Nível de IA:**
- Conhecimento atual: ${form.nivel_ia || "Iniciante"}
- Experiência prévia: ${form.experiencia_ia || "Nenhuma"}
- Ferramentas que usa: ${form.ferramentas_ia ? JSON.stringify(form.ferramentas_ia) : "Nenhuma"}
- Frequência de uso: ${form.frequencia_uso_ia || "Não usa"}

**Objetivos e Desafios:**
- Objetivo principal: ${form.objetivo_principal || "Não informado"}
- Meta 3 meses: ${form.meta_3_meses || "Não informado"}
- Meta 12 meses: ${form.meta_12_meses || "Não informado"}
- Maior dificuldade: ${form.maior_dificuldade_ia || "Não informado"}
- Desafios: ${[form.desafio_1, form.desafio_2, form.desafio_3].filter(Boolean).join(", ") || "Não informado"}

**Preferências de Aprendizado:**
- Estilo: ${form.estilo_aprendizagem || "Não informado"}
- Tempo disponível: ${form.tempo_disponivel || "Não informado"}
- Melhor horário: ${form.melhor_horario || "Não informado"}`;
    }

    if (objetivos.data && objetivos.data.length > 0) {
      systemPrompt += `\n\n## Objetivos de Desenvolvimento Atuais:
${objetivos.data.map((obj: any) => `- ${obj.objetivo} (${obj.progresso}% concluído, prazo: ${obj.prazo || "indefinido"})`).join("\n")}

✱ **Importante**: Sempre que relevante, relacione suas respostas aos objetivos acima e sugira como o usuário pode progredir neles.`;
    }

    const isMentorado = roles.data?.some((r: any) => r.role === "mentorado");
    if (isMentorado) {
      systemPrompt += `\n\n✱ Usuário tem acesso completo à plataforma de mentoria com trilhas personalizadas.`;
    }

    // Adicionar trilhas disponíveis
    if (trilhas.data && trilhas.data.length > 0) {
      systemPrompt += `\n\n## 🛤️ Trilhas Disponíveis na Plataforma:
${trilhas.data.map((t: any) => `- **${t.titulo}** (${t.nivel}): ${t.descricao}`).join("\n")}`;
    }

    // Adicionar cursos disponíveis
    if (cursos.data && cursos.data.length > 0) {
      systemPrompt += `\n\n## 📖 Cursos Disponíveis:
${cursos.data.map((c: any) => `- **${c.titulo}**: ${c.descricao}`).join("\n")}`;
    }

    // Adicionar base de conhecimento
    if (knowledgeBase.data && knowledgeBase.data.length > 0) {
      systemPrompt += `\n\n## 📚 Base de Conhecimento Interna:
${knowledgeBase.data.map((kb: any) => `
**${kb.titulo}** (${kb.categoria}):
${kb.conteudo_extraido}
`).join("\n")}

✱ **Use essas informações** para complementar suas respostas quando relevante, mas mantenha o foco no que o usuário está perguntando.`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não está configurada");
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const requestBody2 = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    };

    console.log("[ai-chat-user] Chamando Lovable AI Gateway...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody2),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[ai-chat-user] Erro da AI Gateway (${aiResponse.status}):`, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Erro da AI Gateway: ${aiResponse.status}`);
    }

    console.log("[ai-chat-user] Streaming resposta para o cliente...");
    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });

  } catch (error) {
    console.error("[ai-chat-user] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
