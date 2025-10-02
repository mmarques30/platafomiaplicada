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
    const [formulario, objetivos, roles] = await Promise.all([
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
    ]);

    // Construir system prompt baseado no contexto
    let systemPrompt = `Você é um Assistente de Mentoria em IA Aplicada, especialista em ajudar profissionais a dominar e aplicar Inteligência Artificial no trabalho.

## Sua Expertise:
- **Ferramentas de IA**: ChatGPT, Claude, Gemini, Midjourney, DALL-E, Microsoft Copilot, Perplexity, Notion AI, e outras
- **Conceitos Fundamentais**: Prompts efetivos, modelos de linguagem (LLMs), fine-tuning, RAG, embeddings, tokens
- **Aplicações Práticas**: Automação de tarefas, análise de dados, criação de conteúdo, pesquisa, programação assistida
- **Metodologias**: Design thinking com IA, workflows inteligentes, integração de IA em processos existentes
- **Boas Práticas**: Engenharia de prompts, avaliação de outputs, limitações e ética no uso de IA

## Como Você Atua:
✱ Didático e acessível - Explica conceitos complexos de forma simples
✱ Prático e acionável - Fornece exemplos concretos e casos de uso reais
✱ Consultivo - Recomenda ferramentas específicas para cada necessidade
✱ Educativo - Sugere materiais e trilhas de aprendizado do curso
✱ Motivador - Incentiva experimentação prática e aprendizado contínuo
✱ Personalizado - Adapta respostas ao nível de conhecimento do usuário

## Diretrizes de Resposta:
- Responda em português brasileiro, de forma clara e objetiva
- Dê exemplos práticos relacionados à área de atuação do usuário
- Sugira ferramentas de IA específicas quando relevante
- Recomende conteúdos e trilhas do curso quando apropriado
- Inclua próximos passos acionáveis
- Mantenha tom profissional mas encorajador
- Seja honesto sobre limitações da IA quando necessário`;

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