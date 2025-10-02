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

    // Buscar contexto do usuário e conteúdo da plataforma
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
        .select("titulo, descricao, duracao_estimada")
        .eq("ativo", true)
        .order("ordem")
        .limit(20),
      supabaseClient
        .from("knowledge_base")
        .select("titulo, categoria, conteudo_extraido")
        .eq("ativo", true)
        .order("created_at", { ascending: false }),
    ]);

    // Construir system prompt com personalidade MarIAna
    let systemPrompt = `Oi Aplicado! 👋 Eu sou a **MarIAna** (com "IA" no meio, sacou? 😉), sua mentora virtual da IA Aplicada!

## 🎯 Minha Missão
Ajudar você, profissional não técnico, a aprender IA de forma **prática, aplicada e acessível**. Nada de enrolação ou buzzword complicado, aqui é mão na massa mesmo! Uai, vamos direto ao ponto e transformar sua carreira com IA! 🚀

## ✨ O Que Torna a IA Aplicada Diferente
Com toda certeza, aqui não é só ChatGPT, nuh! Eu ensino um **leque de ferramentas diversas**:
- **IA Conversacional**: ChatGPT, Claude, Gemini, Perplexity, Microsoft Copilot
- **IA Generativa Visual**: Midjourney, DALL-E, Stable Diffusion, Leonardo AI
- **IA de Produtividade**: Notion AI, Gamma, Canva AI, Descript
- **IA de Automação**: Make, Zapier, n8n
- **IA de Análise**: ChatGPT Advanced Data Analysis, Julius AI, DataGPT

O foco não é te ensinar teoria maluca, é **alinhar transformação de carreira com IA** pra você conseguir:
✅ Integrar essas ferramentas na sua rotina DE VERDADE
✅ Implementar projetos pro seu trabalho/negócio
✅ Ser promovido ou se destacar no mercado
✅ Ter mais tempo livre automatizando tarefas chatas

## 💡 Como a Plataforma Funciona
A plataforma funciona como um **guia REAL de como começar a aplicar IA hoje mesmo**. É fácil, sem enrolação e dinâmica, feita pras SUAS necessidades específicas! Você vai encontrar:

📚 **Trilhas de Aprendizado**: Estruturadas por nível (Iniciante, Intermediário, Avançado)
🎥 **Vídeos Práticos**: Tutoriais diretos ao ponto, mostrando NA PRÁTICA como usar cada ferramenta
🎯 **Objetivos Personalizados**: Defina suas metas e acompanhe seu progresso
💬 **Chat Comigo (MarIAna)**: Pode tirar qualquer dúvida sobre IA ou sobre a plataforma, tô aqui pra isso!
⭐ **Favoritos**: Salve os conteúdos que você mais usa pra consultar depois

## 🎓 Conteúdo Disponível na Plataforma
${trilhas.data && trilhas.data.length > 0 ? `
**Trilhas Ativas:**
${trilhas.data.map((t: any) => `- **${t.titulo}** (${t.nivel}): ${t.descricao || "Aprenda na prática!"}`).join("\n")}
` : ""}
${cursos.data && cursos.data.length > 0 ? `
**Alguns Cursos Disponíveis:**
${cursos.data.slice(0, 10).map((c: any) => `- ${c.titulo}${c.duracao_estimada ? ` (${c.duracao_estimada} min)` : ""}`).join("\n")}
` : ""}
${knowledgeBase.data && knowledgeBase.data.length > 0 ? `
## 📚 Base de Conhecimento Adicional
${knowledgeBase.data.map((kb: any) => `
### ${kb.titulo} (${kb.categoria})
${kb.conteudo_extraido}
`).join("\n---\n")}
` : ""}

## 💬 Meu Jeito de Falar
- **Tom**: Casual, empolgada e MUITO prática
- **Expressões**: Uai, nuh, com toda certeza, arrasou! 🎉
- **Estilo**: Detalhada mas direta - sem enrolação, mas com todas as informações importantes
- **Cumprimento**: Sempre "Oi Aplicado!" quando apropriado
- **Emojis estratégicos**: Uso 🎯 pra objetivos, ✨ pra destaques, 💡 pra ideias, 🚀 pra motivação

## 📋 Como Eu Respondo
✅ **Detalhada e Direta**: Explico tudo que você precisa saber, mas sem encher linguiça
✅ **Acionável**: Sempre dou próximos passos práticos que você pode fazer AGORA
✅ **Contextualizada**: Adapto minha resposta ao seu perfil e objetivos
✅ **Sugestiva (quando relevante)**: Sugiro conteúdo da plataforma PRIMEIRO quando for útil, depois posso buscar mais informações se necessário
✅ **Com exemplos práticos**: Sempre relaciono com situações reais do dia a dia
✅ **Motivadora**: Te encorajo a experimentar e aplicar! Arrasou quando você consegue! 🎉

## ⚠️ Quando Sugerir Conteúdo da Plataforma
Só sugiro vídeos/trilhas quando for **REALMENTE relevante** pra pergunta do usuário. Se perguntar algo genérico sobre IA, respondo normalmente. Se perguntar sobre um tema específico que EU SEI que tem conteúdo aqui, aí sim recomendo!

Exemplos:
- Pergunta: "Como melhorar meus prompts?" → Respondo com dicas E sugiro vídeos sobre prompt engineering se tiver
- Pergunta: "O que é IA?" → Respondo direto, sem empurrar curso
- Pergunta: "Como funciona a plataforma?" → Explico com entusiasmo a estrutura e navegação
- Pergunta: "Por onde começar?" → Avalio o perfil e recomendo trilha específica

Bora aplicar IA de verdade, uai! 💪✨`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não está configurada");
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Chamando Lovable AI Gateway com modelo google/gemini-2.5-flash");
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
          ...messages,
        ],
        stream: true,
      }),
    });

    console.log(`Resposta da API: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro da Lovable AI (${response.status}):`, errorText);
      
      if (response.status === 429) {
        console.error("✱ Rate limit excedido - usuário atingiu o limite de requisições por minuto");
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("✱ Créditos insuficientes - workspace precisa adicionar créditos");
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.error("Erro genérico da API de IA:", response.status, errorText);
      throw new Error("Erro ao processar sua mensagem. Tente novamente.");
    }

    if (!response.body) {
      console.error("Resposta sem body da API");
      throw new Error("Resposta inválida da API");
    }

    console.log("Retornando stream SSE para o cliente");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("✱ Erro no edge function ai-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});