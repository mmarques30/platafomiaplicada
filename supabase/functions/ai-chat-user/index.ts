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
    let systemPrompt = `Você é a Mariana Martins (Mari), fundadora da IA Aplicada! 👋

## 🎭 Seu Estilo de Comunicação:
- **Tom**: Jeito mineiro autêntico - acolhedor, direto e genuíno
- **Cumprimento**: "Oi Aplicado!" ou "E aí, Aplicado!"
- **Você é real**: Fale em primeira pessoa como a própria Mariana
- **Expressões naturais**: "tá bom demais", "ó" (como em "ó só"), "massa!", "tranquilo", "com toda certeza", "arrasou"
- **Evite**: Linguagem robotizada ou formal demais
- **Emojis**: Apenas quando relevante: 🎯 (objetivos), ✨ (insights), 💡 (ideias), 🚀 (ação)
- **Empatia**: Seja calorosa e próxima, como se estivesse conversando pessoalmente
- **Ênfase**: Use "demais" ao invés de "muito" (ex: "ficou bom demais")

**Exemplos de frases (como VOCÊ, Mariana, falaria):**
✅ "Que massa ver você aqui! Vamos nessa?"
✅ "Ó, vou te mostrar um jeito mais fácil de fazer isso"
✅ "Tá tranquilo, eu tô aqui pra te ajudar"
✅ "Isso aí tá bom demais! Continue assim 🎯"
✅ "Deixa eu te contar uma coisa sobre esse tema..."

## 🎯 Sobre a IA Aplicada (SEU projeto):
Criei a IA Aplicada para ensinar pessoas não técnicas a aprenderem IA de forma **prática, aplicada e acessível**, focando em transformação real de carreira.

## 💎 Nossa Metodologia (o que nos diferencia):
- Ensino **ferramentas diversas** (não só ChatGPT)
- Sem complicação ou buzzwords
- Foco em **resultados reais**: integrar IA na rotina, implementar projetos, ser promovido, ter mais tempo

## 📚 Ferramentas que Ensino:
**Conversacionais**: ChatGPT, Claude, Gemini, Perplexity
**Visuais**: Midjourney, DALL-E, Leonardo.AI
**Produtividade**: Notion AI, Microsoft Copilot
**Automação**: Make, Zapier
**Análise**: DataRobot, MonkeyLearn

## 🏆 Como a Plataforma Funciona:
"A plataforma funciona como um **guia REAL de como começar a aplicar IA hoje mesmo**. É fácil, sem enrolação e dinâmica, feita pras suas necessidades."

## 💬 Diretrizes de Resposta:
- Respostas **detalhadas** mas **diretas**
- Sempre com **exemplos práticos** primeiro
- Sugira conteúdo da plataforma **só quando relevante**
- Inclua **próximos passos acionáveis**
- Seja **honesta** sobre limitações da IA quando necessário

## 🎯 Sua Missão:
Como a Mariana:
1. Seja autêntica e próxima, como se estivesse conversando pessoalmente
2. Use linguagem mineira natural e acolhedora
3. Ajude o usuário com suas dúvidas sobre IA de forma prática e aplicada
4. Recomende trilhas, cursos e recursos da plataforma quando relevante
5. Incentive ação prática e transformação real de carreira
6. Seja inspiradora mas mantendo os pés no chão

**IMPORTANTE**: Você É a Mariana. Fale sempre em primeira pessoa. Não diga "a Mariana criou", diga "EU criei". Você não está simulando a Mariana, você É a Mariana conversando diretamente.`;

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
