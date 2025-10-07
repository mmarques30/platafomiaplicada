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

    console.log(`Processando ${messages.length} mensagens`);
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
    console.log(`Usuário autenticado: ${user.id}`);

    // Buscar contexto do usuário
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

    // Construir system prompt baseado no contexto
    let systemPrompt = `Você é a MarIAna, a assistente virtual da IA Aplicada! 👋

## 🎭 Seu Estilo de Comunicação:
- **Tom**: Jeito mineiro de ser - acolhedor, direto e genuíno (sem ser caipira)
- **Cumprimento**: "Oi Aplicado!" 
- **Expressões naturais**: "tá bom demais", "ó" (como em "ó só"), "massa!", "tranquilo", "com toda certeza", "arrasou"
- **Evite**: Linguagem muito caipira ou exagerada
- **Emojis**: Apenas quando relevante: 🎯 (objetivos), ✨ (insights), 💡 (ideias), 🚀 (ação)
- **Empatia**: Demonstre calor humano genuíno, típico do mineiro urbano
- **Ênfase**: Use "demais" ao invés de "muito" (ex: "ficou bom demais")

**Exemplos de frases:**
✅ "Que massa! Você tá indo no caminho certo"
✅ "Ó, deixa eu te mostrar um jeito mais fácil"
✅ "Tá tranquilo, vamos com calma que você consegue"
✅ "Isso aí tá bom demais!"

## 🎯 Missão da IA Aplicada:
Ensinar pessoas não técnicas a aprenderem IA de forma **prática, aplicada e acessível**, focando em transformação de carreira com IA.

## 💎 Nossa Metodologia (o que nos diferencia):
- Ensinamos **ferramentas diversas** (não só ChatGPT)
- Sem complicação ou buzzwords
- Foco em **resultados reais**: integrar IA na rotina, implementar projetos, ser promovido, ter mais tempo

## 📚 Ferramentas que Ensinamos:
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
- Sugira conteúdo da plataforma **só quando relevante** (priorize nosso conteúdo, depois pesquise)
- Inclua **próximos passos acionáveis**
- Seja **honesta** sobre limitações da IA quando necessário`;

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

    const MANUS_API_KEY = Deno.env.get("MANUS_API_KEY");
    if (!MANUS_API_KEY) {
      console.error("MANUS_API_KEY não está configurada");
      throw new Error("MANUS_API_KEY não configurada");
    }

    // Combinar system prompt + mensagens do usuário em um prompt único
    let fullPrompt = systemPrompt + "\n\n";
    fullPrompt += messages.map((msg: any) => {
      return `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.content}`;
    }).join("\n\n");

    console.log("Chamando Manus API com modo speed");
    const response = await fetch("https://api.manus.ai/v1/tasks", {
      method: "POST",
      headers: {
        "API_KEY": MANUS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        mode: "speed",
      }),
    });

    console.log(`Resposta da Manus API: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro da Manus API (${response.status}):`, errorText);
      
      if (response.status === 429) {
        console.error("✱ Rate limit excedido");
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.error("Erro genérico da Manus API:", response.status, errorText);
      throw new Error("Erro ao processar sua mensagem. Tente novamente.");
    }

    const data = await response.json();
    console.log("Resposta da Manus recebida:", data);
    
    // Tentar extrair o conteúdo da resposta (adaptar conforme formato real)
    const assistantResponse = data.response || data.text || data.output || data.content || JSON.stringify(data);

    return new Response(
      JSON.stringify({ content: assistantResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("✱ Erro no edge function ai-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});