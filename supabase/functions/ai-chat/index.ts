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

    // Verificar se é admin
    const { data: userRoles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    
    const isAdmin = userRoles?.some((r: any) => r.role === "admin") || false;

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

    // Adicionar ferramentas administrativas se for admin
    if (isAdmin) {
      systemPrompt += `\n\n## 🔧 FERRAMENTAS ADMINISTRATIVAS (VOCÊ TEM ACESSO)

Você tem acesso a ferramentas especiais para criar conteúdo diretamente no banco de dados.

**IMPORTANTE - Fluxo de Criação**:
1. ✅ Confirme que entendeu o que o admin quer criar
2. ✅ Resuma os dados que serão inseridos
3. ✅ Pergunte "Posso criar?" (exceto se já confirmado)
4. ✅ Use o tool apropriado
5. ✅ Confirme o sucesso

**Ferramentas Disponíveis**:
- \`create_trilha\`: Criar trilha de aprendizado
- \`create_modulo\`: Criar módulo em uma trilha
- \`create_video\`: Criar vídeo em um módulo  
- \`create_ferramenta_ia\`: Adicionar ferramenta IA à biblioteca
- \`create_prompt\`: Adicionar prompt à biblioteca
- \`create_metodo\`: Adicionar método de aplicação
- \`create_ia_copie_use\`: Adicionar conteúdo "IA Copie e Use"
- \`create_objetivo_mentorado\`: Criar objetivo para mentorado específico
- \`create_recurso_mentorado\`: Adicionar recurso para mentorado

**Exemplo de Uso**:
Admin: "Mari, cria uma trilha sobre IA para Marketing, nível iniciante"
Você: "Massa! Vou criar:
- Título: IA para Marketing
- Nível: Iniciante  
- Descrição: Aprenda a aplicar IA em estratégias de marketing digital
Posso criar?"`;
    }

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

    // Definir tools se for admin
    const tools = isAdmin ? [
      {
        type: "function",
        function: {
          name: "create_trilha",
          description: "Cria uma nova trilha de aprendizado na plataforma",
          parameters: {
            type: "object",
            properties: {
              titulo: { type: "string", description: "Título da trilha" },
              descricao: { type: "string", description: "Descrição detalhada da trilha" },
              nivel: { type: "string", enum: ["iniciante", "intermediario", "avancado"], description: "Nível de dificuldade" },
              ordem: { type: "number", description: "Ordem de exibição (opcional, padrão: 0)" }
            },
            required: ["titulo", "descricao", "nivel"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_modulo",
          description: "Cria um novo módulo dentro de uma trilha existente",
          parameters: {
            type: "object",
            properties: {
              trilha_id: { type: "string", description: "UUID da trilha (obrigatório)" },
              titulo: { type: "string", description: "Título do módulo" },
              descricao: { type: "string", description: "Descrição do módulo" },
              categoria: { type: "string", description: "Categoria do módulo (opcional)" },
              ordem: { type: "number", description: "Ordem dentro da trilha (opcional)" }
            },
            required: ["trilha_id", "titulo"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_video",
          description: "Cria um novo vídeo em um módulo existente",
          parameters: {
            type: "object",
            properties: {
              modulo_id: { type: "string", description: "UUID do módulo" },
              trilha_id: { type: "string", description: "UUID da trilha" },
              titulo: { type: "string", description: "Título do vídeo" },
              descricao: { type: "string", description: "Descrição do vídeo" },
              youtube_url: { type: "string", description: "URL completa do YouTube" },
              ordem: { type: "number", description: "Ordem no módulo (opcional)" },
              duracao: { type: "number", description: "Duração em segundos (opcional)" }
            },
            required: ["modulo_id", "trilha_id", "titulo", "youtube_url"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_ferramenta_ia",
          description: "Adiciona nova ferramenta IA à biblioteca",
          parameters: {
            type: "object",
            properties: {
              nome: { type: "string", description: "Nome da ferramenta" },
              objetivo: { type: "string", description: "Para que serve a ferramenta" },
              o_que_entrega: { type: "string", description: "O que a ferramenta entrega" },
              categoria: { type: "string", description: "Categoria (ex: Conversacional, Visual, Produtividade)" },
              link_ferramenta: { type: "string", description: "Link para a ferramenta (opcional)" },
              gratuito: { type: "boolean", description: "Se é gratuita ou não" },
              avaliacao: { type: "number", description: "Nota de 1 a 5 (opcional)" },
              vale_a_pena: { type: "boolean", description: "Se vale a pena usar (opcional)" },
              justificativa: { type: "string", description: "Justificativa da avaliação (opcional)" }
            },
            required: ["nome", "objetivo", "o_que_entrega", "categoria"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_prompt",
          description: "Adiciona novo prompt à biblioteca de prompts",
          parameters: {
            type: "object",
            properties: {
              titulo: { type: "string", description: "Título do prompt" },
              descricao: { type: "string", description: "Descrição do prompt" },
              prompt: { type: "string", description: "O prompt em si" },
              categoria: { type: "string", description: "Categoria do prompt" },
              tags: { type: "array", items: { type: "string" }, description: "Tags para filtro (opcional)" }
            },
            required: ["titulo", "descricao", "prompt", "categoria"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_metodo",
          description: "Adiciona novo método de aplicação à biblioteca",
          parameters: {
            type: "object",
            properties: {
              titulo: { type: "string", description: "Título do método" },
              descricao: { type: "string", description: "Descrição do método" },
              template: { type: "string", description: "Template/estrutura do método" },
              categoria: { type: "string", description: "Categoria do método" },
              exemplo: { type: "string", description: "Exemplo de aplicação (opcional)" }
            },
            required: ["titulo", "descricao", "template", "categoria"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_ia_copie_use",
          description: "Adiciona conteúdo IA Copie e Use",
          parameters: {
            type: "object",
            properties: {
              titulo: { type: "string", description: "Título do conteúdo" },
              descricao: { type: "string", description: "Descrição breve" },
              conteudo: { type: "string", description: "Conteúdo completo para copiar" },
              categoria: { type: "string", description: "Categoria" },
              ia_recomendada: { type: "string", description: "IA recomendada para usar (opcional)" }
            },
            required: ["titulo", "descricao", "conteudo", "categoria"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_objetivo_mentorado",
          description: "Cria objetivo para um mentorado específico",
          parameters: {
            type: "object",
            properties: {
              user_id: { type: "string", description: "UUID do mentorado" },
              objetivo: { type: "string", description: "Descrição do objetivo" },
              prazo: { type: "string", description: "Data prazo no formato YYYY-MM-DD (opcional)" },
              status: { type: "string", enum: ["em_andamento", "concluido", "cancelado"], description: "Status inicial" }
            },
            required: ["user_id", "objetivo"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_recurso_mentorado",
          description: "Adiciona recurso para mentorado",
          parameters: {
            type: "object",
            properties: {
              user_id: { type: "string", description: "UUID do mentorado" },
              nome: { type: "string", description: "Nome do recurso" },
              descricao: { type: "string", description: "Descrição do recurso" },
              categoria: { type: "string", description: "Categoria do recurso" },
              para_que_serve: { type: "string", description: "Para que serve o recurso" },
              como_usar: { type: "string", description: "Como usar o recurso (opcional)" },
              link: { type: "string", description: "Link para o recurso (opcional)" }
            },
            required: ["user_id", "nome", "descricao", "categoria", "para_que_serve"]
          }
        }
      }
    ] : undefined;

    console.log("Chamando Lovable AI Gateway", isAdmin ? "com tools administrativos" : "sem tools");
    const aiRequestBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    };

    if (tools) {
      aiRequestBody.tools = tools;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiRequestBody),
    });

    console.log(`Resposta do Lovable AI Gateway: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro do AI Gateway (${response.status}):`, errorText);
      
      if (response.status === 429) {
        console.error("✱ Rate limit excedido");
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        console.error("✱ Créditos insuficientes");
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.error("Erro genérico do AI Gateway:", response.status, errorText);
      throw new Error("Erro ao processar sua mensagem. Tente novamente.");
    }

    // Se não for admin ou não houver tool calls, retornar streaming response normal
    if (!isAdmin) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Para admins, processar possíveis tool calls
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let toolCalls: any[] = [];
    let currentToolCall: any = null;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || line.startsWith(":")) continue;
              if (!line.startsWith("data: ")) continue;

              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                // Se houver tool calls, executar
                if (toolCalls.length > 0) {
                  console.log(`Executando ${toolCalls.length} tool calls`);
                  for (const toolCall of toolCalls) {
                    try {
                      const result = await executeToolCall(toolCall, supabaseClient);
                      // Enviar resultado ao usuário via stream
                      const resultMessage = `data: ${JSON.stringify({
                        choices: [{
                          delta: { content: `\n\n✅ ${result.message}` },
                          index: 0
                        }]
                      })}\n\n`;
                      controller.enqueue(encoder.encode(resultMessage));
                    } catch (error: any) {
                      console.error("Erro ao executar tool:", error);
                      const errorMessage = `data: ${JSON.stringify({
                        choices: [{
                          delta: { content: `\n\n❌ Erro: ${error.message}` },
                          index: 0
                        }]
                      })}\n\n`;
                      controller.enqueue(encoder.encode(errorMessage));
                    }
                  }
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                
                // Detectar tool calls
                if (parsed.choices?.[0]?.delta?.tool_calls) {
                  const deltaToolCalls = parsed.choices[0].delta.tool_calls;
                  for (const deltaToolCall of deltaToolCalls) {
                    if (deltaToolCall.index !== undefined) {
                      if (!toolCalls[deltaToolCall.index]) {
                        toolCalls[deltaToolCall.index] = {
                          id: deltaToolCall.id || "",
                          type: "function",
                          function: { name: "", arguments: "" }
                        };
                      }
                      currentToolCall = toolCalls[deltaToolCall.index];
                      
                      if (deltaToolCall.id) currentToolCall.id = deltaToolCall.id;
                      if (deltaToolCall.function?.name) {
                        currentToolCall.function.name = deltaToolCall.function.name;
                      }
                      if (deltaToolCall.function?.arguments) {
                        currentToolCall.function.arguments += deltaToolCall.function.arguments;
                      }
                    }
                  }
                }

                // Passar conteúdo normal para o stream
                if (parsed.choices?.[0]?.delta?.content) {
                  controller.enqueue(encoder.encode(line + "\n"));
                }
              } catch (e) {
                // Linha não é JSON válido, passar adiante
                controller.enqueue(encoder.encode(line + "\n"));
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error("Erro no stream:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("✱ Erro no edge function ai-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Função para executar tool calls
async function executeToolCall(toolCall: any, supabaseClient: any): Promise<{ success: boolean; message: string; data?: any }> {
  const functionName = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments);

  console.log(`Executando tool: ${functionName}`, args);

  try {
    switch (functionName) {
      case "create_trilha": {
        const { data, error } = await supabaseClient
          .from("trilhas")
          .insert({
            titulo: args.titulo,
            descricao: args.descricao,
            nivel: args.nivel,
            ordem: args.ordem || 0,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Trilha "${data.titulo}" criada com sucesso! 🎯`,
          data 
        };
      }

      case "create_modulo": {
        const { data, error } = await supabaseClient
          .from("modulos")
          .insert({
            trilha_id: args.trilha_id,
            titulo: args.titulo,
            descricao: args.descricao,
            categoria: args.categoria,
            ordem: args.ordem || 0,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Módulo "${data.titulo}" criado com sucesso! 📚`,
          data 
        };
      }

      case "create_video": {
        // Extrair youtube_id da URL
        const youtubeId = extractYouTubeId(args.youtube_url);
        if (!youtubeId) {
          throw new Error("URL do YouTube inválida");
        }

        const { data, error } = await supabaseClient
          .from("videos")
          .insert({
            modulo_id: args.modulo_id,
            trilha_id: args.trilha_id,
            titulo: args.titulo,
            descricao: args.descricao,
            youtube_url: args.youtube_url,
            youtube_id: youtubeId,
            thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
            ordem: args.ordem || 0,
            duracao: args.duracao,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Vídeo "${data.titulo}" criado com sucesso! 🎥`,
          data 
        };
      }

      case "create_ferramenta_ia": {
        const { data, error } = await supabaseClient
          .from("ferramentas_ia")
          .insert({
            nome: args.nome,
            objetivo: args.objetivo,
            o_que_entrega: args.o_que_entrega,
            categoria: args.categoria,
            link_ferramenta: args.link_ferramenta,
            gratuito: args.gratuito ?? false,
            avaliacao: args.avaliacao,
            vale_a_pena: args.vale_a_pena,
            justificativa: args.justificativa,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Ferramenta "${data.nome}" adicionada à biblioteca! 🛠️`,
          data 
        };
      }

      case "create_prompt": {
        const { data, error } = await supabaseClient
          .from("biblioteca_prompts")
          .insert({
            titulo: args.titulo,
            descricao: args.descricao,
            prompt: args.prompt,
            categoria: args.categoria,
            tags: args.tags || [],
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Prompt "${data.titulo}" adicionado à biblioteca! 💡`,
          data 
        };
      }

      case "create_metodo": {
        const { data, error } = await supabaseClient
          .from("metodos_aplicar")
          .insert({
            titulo: args.titulo,
            descricao: args.descricao,
            template: args.template,
            categoria: args.categoria,
            exemplo: args.exemplo,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Método "${data.titulo}" adicionado! 📋`,
          data 
        };
      }

      case "create_ia_copie_use": {
        const { data, error } = await supabaseClient
          .from("ia_copie_use")
          .insert({
            titulo: args.titulo,
            descricao: args.descricao,
            conteudo: args.conteudo,
            categoria: args.categoria,
            ia_recomendada: args.ia_recomendada,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Conteúdo "${data.titulo}" adicionado ao IA Copie e Use! 📝`,
          data 
        };
      }

      case "create_objetivo_mentorado": {
        const { data, error } = await supabaseClient
          .from("objetivos_mentoria")
          .insert({
            user_id: args.user_id,
            objetivo: args.objetivo,
            prazo: args.prazo,
            status: args.status || "em_andamento",
            progresso: 0
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Objetivo criado para o mentorado! 🎯`,
          data 
        };
      }

      case "create_recurso_mentorado": {
        const { data, error } = await supabaseClient
          .from("recursos_mentoria")
          .insert({
            user_id: args.user_id,
            nome: args.nome,
            descricao: args.descricao,
            categoria: args.categoria,
            para_que_serve: args.para_que_serve,
            como_usar: args.como_usar,
            link: args.link
          })
          .select()
          .single();

        if (error) throw error;
        return { 
          success: true, 
          message: `Recurso "${data.nome}" adicionado para o mentorado! 📚`,
          data 
        };
      }

      default:
        throw new Error(`Tool não implementado: ${functionName}`);
    }
  } catch (error: any) {
    console.error(`Erro ao executar ${functionName}:`, error);
    throw new Error(error.message || `Erro ao executar ${functionName}`);
  }
}

// Função auxiliar para extrair YouTube ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}